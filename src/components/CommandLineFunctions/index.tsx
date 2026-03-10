import React, { useState } from "react";
import { socialMediaLinks } from "utils/constants";
import { formatTitle } from "utils/format";
import { zustandStore, themeStore } from "utils/store";
import "./commandLineFunctions.scss";

export { MessageEditor } from "../MessageEditor";


const Projects = () => {
  const { projects } = zustandStore();

  if (projects.length === 0) return <div>No projects yet. Stay tuned!</div>;

  return (
    <div className="Project_section Function_container">
      {projects.map((project) => (
        <ul key={project._id}>
          <li className="faj-b-project">
            <span>
              <a href={project.demo} target="_blank" rel="noreferrer">
                {project.name}
              </a>

              <span
                onClick={() => {
                  const clipboard = `cd ${formatTitle(project.name)} -p`;
                  navigator.clipboard.writeText(clipboard);
                }}
              >
                cd {formatTitle(project.name)} -p
              </span>
            </span>

            <p className="mt-5">{project.about.split(".")[0]}</p>
          </li>
        </ul>
      ))}
    </div>
  );
};

const Neofetch = () => {
  const { setTheme } = themeStore();

  const themes = [
    { name: "linux", color: "#390c78" },
    { name: "matrix", color: "#00ff41" },
    { name: "dracula", color: "#bd93f9" },
    { name: "ubuntu", color: "#e95420" },
    { name: "light", color: "#ffffff" },
  ];

  return (
    <div className="Neofetch_container">
      <div className="Neofetch_ascii">{`
  ██████╗ ██╗  ██╗ █████╗ ███╗   ██╗██╗   ██╗
  ██╔══██╗██║  ██║██╔══██╗████╗  ██║██║   ██║
  ██████╔╝███████║███████║██╔██╗ ██║██║   ██║
  ██╔══██╗██╔══██║██╔══██║██║╚██╗██║██║   ██║
  ██████╔╝██║  ██║██║  ██║██║ ╚████║╚██████╔╝
  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝

  ██████╗ ██╗███████╗████████╗ █████╗
  ██╔══██╗██║██╔════╝╚══██╔══╝██╔══██╗
  ██████╔╝██║███████╗   ██║   ███████║
  ██╔══██╗██║╚════██║   ██║   ██╔══██║
  ██████╔╝██║███████║   ██║   ██║  ██║
  ╚═════╝ ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ `}</div>
      <div className="Neofetch_info">
        <div className="Neofetch_title">bhanubista@terminal</div>
        <div className="Neofetch_divider">──────────────────</div>
        <div className="Neofetch_row">
          <span className="Neofetch_key">Role</span>
          <span className="Neofetch_value">CS Student</span>
        </div>
        <div className="Neofetch_row">
          <span className="Neofetch_key">Focus</span>
          <span className="Neofetch_value">Cybersecurity</span>
        </div>
        <div className="Neofetch_row">
          <span className="Neofetch_key">Shell</span>
          <span className="Neofetch_value">bash/zsh</span>
        </div>
        <div className="Neofetch_row">
          <span className="Neofetch_key">Languages</span>
          <span className="Neofetch_value">Python, C</span>
        </div>
        <div className="Neofetch_row">
          <span className="Neofetch_key">OS</span>
          <span className="Neofetch_value">Linux 🐧</span>
        </div>
        <div className="Neofetch_row">
          <span className="Neofetch_key">Learning</span>
          <span className="Neofetch_value">Ethical Hacking, Networking</span>
        </div>
        <div className="Neofetch_row">
          <span className="Neofetch_key">Status</span>
          <span className="Neofetch_value">Breaking into the field 🚀</span>
        </div>
        <div className="Neofetch_row">
          <span className="Neofetch_key">GitHub</span>
          <span className="Neofetch_value">
            <a href="https://github.com/bhanubsta" target="_blank" rel="noreferrer">
              github.com/bhanubsta
            </a>
          </span>
        </div>
        <div className="Neofetch_colors">
          {themes.map((t) => (
            <span
              key={t.name}
              style={{ background: t.color, cursor: "pointer" }}
              onClick={() => setTheme(t.name)}
              title={`Switch to ${t.name} theme`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const Contact: React.FC<{ userQuestion?: string }> = ({ userQuestion }) => {
  const { isEditorOpen } = themeStore();
  const isMessageMode = userQuestion?.includes("-msg");

  if (isMessageMode && isEditorOpen) return <p>Launching Vim Mail Editor...</p>;
  if (isMessageMode && !isEditorOpen) return <p>Vim editor closed.</p>;

  return (
    <div className="Function_container">
      <p>Feel free to reach out!</p>
      <div className="Help_list">
        <div className="Help_item">
          <span className="Help_command">Email</span>
          <span className="Help_description">
            <a href="mailto:bstbhanu@gmail.com">bstbhanu@gmail.com</a>
          </span>
        </div>
        {socialMediaLinks.map(({ name, href }) => (
          <div key={formatTitle(name)} className="Help_item">
            <span className="Help_command">{name}</span>
            <span className="Help_description">
              <a href={href} target="_blank" rel="noreferrer">
                {href}
              </a>
            </span>
          </div>
        ))}
      </div>
      <p className="mt-10">Pro tip: Use <span>"contact -msg"</span> to launch the interactive Vim mail editor!</p>
    </div>
  );
};

export const CommandLineFunctions = [
  {
    functions: "",
    shortcut: "",
    description: <></>,
  },
  {
    functions: "help",
    shortcut: "ls",
    description: (
      <div className="Function_container">
        <p>Available commands:</p>
        <div className="Help_list">
          <div className="Help_item">
            <span className="Help_command">whoami</span>
            <span className="Help_description">— one-liner bio</span>
          </div>
          <div className="Help_item">
            <span className="Help_command">about</span>
            <span className="Help_description">— full background & bio</span>
          </div>
          <div className="Help_item">
            <span className="Help_command">skills</span>
            <span className="Help_description">— tech stack & tools</span>
          </div>
          <div className="Help_item">
            <span className="Help_command">projects</span>
            <span className="Help_description">— all projects</span>
          </div>
          <div className="Help_item">
            <span className="Help_command">contact</span>
            <span className="Help_description">— email, socials & messages (-msg flag)</span>
          </div>
          <div className="Help_item">
            <span className="Help_command">neofetch</span>
            <span className="Help_description">— system info card</span>
          </div>
          <div className="Help_item">
            <span className="Help_command">clear</span>
            <span className="Help_description">— clear the terminal</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    functions: "whoami",
    shortcut: "",
    description: (
      <div className="Function_container">
        <p>CS Student | Cybersecurity</p>
      </div>
    ),
  },
  {
    functions: "about",
    shortcut: "",
    description: (
      <div className="Function_container">
        <p>👋 Hey, I'm Bhanu Bista, a CS student with a passion for cybersecurity.</p>
      </div>
    ),
  },
  {
    functions: "skills",
    shortcut: "",
    description: (
      <div className="Function_container">
        <ul className="ml-20">
          <li>🐍 Python</li>
          <li>🐧 Linux</li>
        </ul>
      </div>
    ),
  },
  {
    functions: "projects",
    shortcut: "",
    description: <Projects />,
  },
  {
    functions: "contact",
    shortcut: "",
    description: <Contact />,
  },
  {
    functions: "mail",
    shortcut: "compose",
    description: <Contact userQuestion="contact -msg" />,
  },
  {
    functions: "neofetch",
    shortcut: "",
    description: (
      <div className="Function_container">
        <Neofetch />
      </div>
    ),
  },
];

