export default {
  async afterCreate(event: any) {
    const { result, params } = event;
    const { data } = params;

    console.log("Task lifecycle - afterCreate triggered:", result);
    console.log("Task data:", data);

    try {
      // Получаем тип задачи и связанный выпуск
      const taskType = result.taskType;
      const issueId = result.issue?.id || data.issue;

      console.log("Task type:", taskType);
      console.log("Issue ID:", issueId);

      if (!taskType || !issueId) {
        console.log("No task type or issue ID, skipping lifecycle");
        return;
      }

      // Проверяем, были ли выбраны существующие статьи/фото
      const selectedArticles = Array.isArray(data.articles)
        ? data.articles
        : data.articles
        ? [data.articles]
        : [];
      const selectedPhotos = Array.isArray(data.photos)
        ? data.photos
        : data.photos
        ? [data.photos]
        : [];

      console.log("Selected articles:", selectedArticles);
      console.log("Selected photos:", selectedPhotos);

      // В зависимости от типа задачи создаем соответствующие элементы
      switch (taskType) {
        case "WRITING":
          let articleIds = [...selectedArticles];
          let photoIds = [...selectedPhotos];

          // Если статья не выбрана - создаем и статью, и фото
          if (selectedArticles.length === 0) {
            // Создаем статью
            const article = await strapi.entityService.create(
              "api::article.article",
              {
                data: {
                  name: `Article: ${result.name}`,
                  text: "",
                  issue: issueId,
                  tasks: [result.id],
                },
              }
            );
            articleIds.push(article.id);
            console.log("Created new article for WRITING task:", article.id);

            // Создаем фото, связанное со статьей
            const photo = await strapi.entityService.create(
              "api::photo.photo",
              {
                data: {
                  name: `Photo for: ${result.name}`,
                  width: 0,
                  height: 0,
                  article: article.id,
                  issue: issueId,
                  tasks: [result.id],
                },
              }
            );
            photoIds.push(photo.id);
            console.log("Created new photo for WRITING task:", photo.id);
          } else {
            // Если статья выбрана, нужно получить связанные с ней фото
            for (const articleId of selectedArticles) {
              const articleWithPhotos = await strapi.entityService.findOne(
                "api::article.article",
                articleId,
                {
                  populate: ["photos"],
                }
              );

              if (articleWithPhotos?.photos?.length > 0) {
                const relatedPhotoIds = articleWithPhotos.photos.map(
                  (photo: any) => photo.id
                );
                photoIds.push(...relatedPhotoIds);
              }
            }
            console.log(
              "Using existing article and related photos for WRITING task"
            );
          }

          // Обновляем задачу, добавляя связи со статьей и фото
          await strapi.entityService.update("api::task.task", result.id, {
            data: {
              articles: articleIds,
              photos: photoIds,
            },
          });

          console.log(
            "Updated WRITING task with articles and photos:",
            articleIds,
            photoIds
          );
          break;

        case "PHOTOGRAPHY":
          let photoIdsForPhoto = [...selectedPhotos];
          let articleIdsForPhoto = [...selectedArticles];

          // Если фото не выбрано - создаем и статью, и фото
          if (selectedPhotos.length === 0) {
            // Создаем статью
            const article = await strapi.entityService.create(
              "api::article.article",
              {
                data: {
                  name: `Article for photo: ${result.name}`,
                  text: "",
                  issue: issueId,
                  tasks: [result.id],
                },
              }
            );
            articleIdsForPhoto.push(article.id);
            console.log(
              "Created new article for PHOTOGRAPHY task:",
              article.id
            );

            // Создаем фото, связанное со статьей
            const photo = await strapi.entityService.create(
              "api::photo.photo",
              {
                data: {
                  name: `Фото: ${result.name}`,
                  width: 0,
                  height: 0,
                  article: article.id,
                  issue: issueId,
                  tasks: [result.id],
                },
              }
            );
            photoIdsForPhoto.push(photo.id);
            console.log("Created new photo for PHOTOGRAPHY task:", photo.id);
          } else {
            // Если фото выбрано, нужно получить связанную с ним статью
            console.log("Processing selected photos:", selectedPhotos);
            for (const photoId of selectedPhotos) {
              console.log("Fetching photo with ID:", photoId);
              const photoWithArticle = await strapi.entityService.findOne(
                "api::photo.photo",
                photoId,
                {
                  populate: ["article"],
                }
              );
              console.log("Photo with article:", photoWithArticle);

              if (photoWithArticle?.article) {
                console.log(
                  "Found related article:",
                  photoWithArticle.article.id
                );
                articleIdsForPhoto.push(photoWithArticle.article.id);
              } else {
                console.log("No related article found for photo:", photoId);
              }
            }
            console.log(
              "Using existing photo and related article for PHOTOGRAPHY task. Final article IDs:",
              articleIdsForPhoto
            );
          }

          // Обновляем задачу, добавляя связи с фото и статьей
          await strapi.entityService.update("api::task.task", result.id, {
            data: {
              photos: photoIdsForPhoto,
              articles: articleIdsForPhoto,
            },
          });

          console.log(
            "Updated PHOTOGRAPHY task with photos and articles:",
            photoIdsForPhoto,
            articleIdsForPhoto
          );
          break;

        case "LAYOUT":
        case "EDITING":
        case "REVIEW":
          // Для других типов задач не создаем дополнительных элементов автоматически
          console.log(`${taskType} task created, no additional items needed`);
          break;

        default:
          console.log("Unknown task type:", taskType);
          break;
      }
    } catch (error) {
      console.error("Error in task lifecycle afterCreate:", error);
    }
  },

  async afterUpdate(event: any) {
    const { result, params } = event;
    const { data } = params;

    console.log("Task lifecycle - afterUpdate triggered:", result);
    console.log("Updated task data:", data);

    // При обновлении задачи не создаем новые элементы автоматически
    // Только если пользователь явно изменил тип задачи
    try {
      const taskType = data.taskType || result.taskType;

      if (data.taskType && data.taskType !== result.taskType) {
        console.log(
          `Task type changed from ${result.taskType} to ${data.taskType}`
        );
        // Можно добавить логику для изменения типа задачи при необходимости
      }
    } catch (error) {
      console.error("Error in task lifecycle afterUpdate:", error);
    }
  },

  async beforeDelete(event: any) {
    const { params } = event;

    console.log("Task lifecycle - beforeDelete triggered");

    try {
      // При удалении задачи не удаляем связанные статьи и фото,
      // так как они могут использоваться в других задачах или контекстах
      console.log(
        "Task will be deleted, but related articles and photos will remain"
      );
    } catch (error) {
      console.error("Error in task lifecycle beforeDelete:", error);
    }
  },
};
