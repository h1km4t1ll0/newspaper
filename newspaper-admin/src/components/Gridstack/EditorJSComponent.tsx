import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import ImageTool from "@editorjs/image";

type EditorJSComponentProps = {
    widgetId: string;
};

const EditorJSComponent = ({ widgetId }: EditorJSComponentProps) => {
    const editorRef = useRef<EditorJS | null>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorContainerRef.current) {
            // Initialize the Editor.js instance with Image plugin
            editorRef.current = new EditorJS({
                holder: editorContainerRef.current,
                placeholder: "Start writing...",
                tools: {
                    image: {
                        class: ImageTool,
                        config: {
                            uploader: {
                                uploadByUrl: (url: string) => {
                                    return new Promise((resolve) => {
                                        // Simulate the image upload process here
                                        // Replace with real image upload logic (e.g., send to server)
                                        resolve({
                                            success: 1,
                                            file: {
                                                url: url, // Set the image URL after upload
                                            },
                                        });
                                    });
                                },
                            },
                        },
                    },
                },
                onChange: async () => {
                    const content = await editorRef.current?.save();
                    console.log("Editor content:", content);
                },
            });
        }

        return () => {
            if (editorRef.current) {
                editorRef.current = null;
            }
        };
    }, []);

    return <div ref={editorContainerRef} id={`editor-${widgetId}`}></div>;
};

export default EditorJSComponent;
