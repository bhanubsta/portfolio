import { client } from "lib/client";
import { Project } from "types/project";
import create from "zustand";
import { handleText } from "./store-functions";

type ProjectStoreProps = {
  projects: Project[];
  fetchProjects: () => void;
};

export type zustandStoreProps = {
  text: string;
  clearText: () => void;
  clearArrayText: () => void;
  setText: (text: string, code: number) => void;
  arrayText: string[];
  currentArrayTextCount: number;
  setArrayText: () => void;
  isInputLocked: boolean;
  setIsInputLocked: (isInputLocked: boolean) => void;
} & ProjectStoreProps;

export const zustandStore = create<zustandStoreProps>((set) => ({
  text: "",

  projects: [
    {
      _id: "1",
      name: "Simple Keylogger",
      demo: "https://github.com/bhanubsta",
      about: "A basic educational keylogger built with Python to understand input logging and filesystem operations.",
    },
    {
      _id: "2",
      name: "Network Scanner",
      demo: "https://github.com/bhanubsta",
      about: "A Python script using Scapy to discover active devices on a local network by sending ARP requests.",
    },
    {
      _id: "3",
      name: "Password Cracker",
      demo: "https://github.com/bhanubsta",
      about: "A simple dictionary-based password cracker for MD5 and SHA-256 hashes.",
    },
  ],

  isInputLocked: false,
  setIsInputLocked: (isInputLocked: boolean) => set({ isInputLocked }),
  fetchProjects: async () => {
    try {
      const projectsQuery = '*[_type == "projects"]';
      const project = await client.fetch(projectsQuery);
      if (project && project.length > 0) {
        set({ projects: project });
      }
    } catch (e) {
      console.warn("Failed to fetch projects from Sanity, using defaults.", e);
    }
  },

  clearText: () => {
    set({ text: "" });
  },

  setText: (string, code) => {
    set((state) => handleText({ ...state, userInput: string, keyCode: code }));
  },

  arrayText: localStorage.getItem("arrayText")
    ? JSON.parse(localStorage.getItem("arrayText")!)
    : [],

  clearArrayText: () => {
    localStorage.removeItem("arrayText");

    set({ arrayText: [] });
  },

  currentArrayTextCount: localStorage.getItem("arrayText")
    ? JSON.parse(localStorage.getItem("arrayText")!).length - 1
    : 0,

  setArrayText: () => {
    set(({ text, arrayText }) => {
      const newArrayText = [...arrayText, text];

      localStorage.setItem("arrayText", JSON.stringify(newArrayText));

      return {
        currentArrayTextCount: arrayText.length - 1,
        arrayText: newArrayText,
      };
    });
  },
}));

type ThemeStoreProps = {
  theme: string;
  setTheme: (theme: string) => void;
  isMaximized: boolean;
  setIsMaximized: (isMaximized: boolean) => void;
  isMinimized: boolean;
  setIsMinimized: (isMinimized: boolean) => void;
  isClosed: boolean;
  setIsClosed: (isClosed: boolean) => void;

  // Editor Overlay State
  isEditorOpen: boolean;
  setIsEditorOpen: (isEditorOpen: boolean) => void;
  editorContent: string[];
  setEditorContent: (content: string[]) => void;
  editorMetadata: {
    to: string;
    subject: string;
    cc: string;
    bcc: string;
  };
  setEditorMetadata: (metadata: any) => void;
  isSending: boolean;
  setIsSending: (isSending: boolean) => void;
  errorMessage: string;
  setErrorMessage: (message: string) => void;
};


export const themeStore = create<ThemeStoreProps>((set) => ({
  theme: "linux",
  setTheme: (theme: string) => set({ theme }),

  isMaximized: false,
  setIsMaximized: (isMaximized: boolean) => set({ isMaximized }),

  isMinimized: false,
  setIsMinimized: (isMinimized: boolean) => set({ isMinimized }),

  isClosed: false,
  setIsClosed: (isClosed: boolean) => set({ isClosed }),

  // Editor Overlay State Initial Values
  isEditorOpen: false,
  setIsEditorOpen: (isEditorOpen: boolean) => set({ isEditorOpen }),
  editorContent: [""],
  setEditorContent: (editorContent: string[]) => set({ editorContent }),
  editorMetadata: { to: "", subject: "", cc: "", bcc: "" },
  setEditorMetadata: (editorMetadata: any) => set({ editorMetadata: { ...editorMetadata } }),
  isSending: false,
  setIsSending: (isSending: boolean) => set({ isSending }),
  errorMessage: "",
  setErrorMessage: (errorMessage: string) => set({ errorMessage }),
}));

