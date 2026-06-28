import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";

import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

import ACTIONS from "./Actions";

type EditorProps = {
  socketRef: React.MutableRefObject<Socket | null>;
  roomId?: string;
  onCodeChange: (code: string) => void;
};

export default function EditorPanel({
  socketRef,
  roomId,
  onCodeChange,
}: EditorProps) {
  const editorRef = useRef<EditorView | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Initialize CodeMirror
  useEffect(() => {
    if (!containerRef.current) return;

    const startState = EditorState.create({
      doc: "",
      extensions: [
        keymap.of(defaultKeymap),
        javascript(),
        oneDark,

        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const code = update.state.doc.toString();

            onCodeChange(code);

            if (socketRef?.current) {
              socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                roomId,
                code,
              });
            }
          }
        }),
      ],
    });

    editorRef.current = new EditorView({
      state: startState,
      parent: containerRef.current,
    });

    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, []);

  // Listen for remote code updates
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleCodeChange = ({ code }: { code: string }) => {
      if (!editorRef.current) return;

      const currentCode = editorRef.current.state.doc.toString();

      if (code !== currentCode) {
        editorRef.current.dispatch({
          changes: {
            from: 0,
            to: currentCode.length,
            insert: code,
          },
        });
      }
    };

    socket.on(ACTIONS.CODE_CHANGE, handleCodeChange);

    return () => {
      socket.off(ACTIONS.CODE_CHANGE, handleCodeChange);
    };
  }, [socketRef.current]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-slate-800 text-white"
    />
  );
}