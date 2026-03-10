import { CommandLineFunctions } from "components/CommandLineFunctions";
import React from "react";
import { socialMediaLinks } from "utils/constants";
import { formatTitle } from "utils/format";
import { zustandStore } from "utils/store";

type Props = {
  userQuestion: string;
};

export const TerminalAnswer: React.FC<Props> = ({ userQuestion }) => {
  const { clearArrayText } = zustandStore();

  if (userQuestion === "clear") clearArrayText();

  const cdProject =
    userQuestion.split(" ")[0] === "cd" && userQuestion.split(" ")[2] === "-p";
  const cdSocial =
    userQuestion.split(" ")[0] === "cd" && userQuestion.split(" ")[2] === "-s";

  if (cdProject) {
    const { projects } = zustandStore();

    const project = projects.find(
      (project) => formatTitle(project.name) === userQuestion.split(" ")[1]
    );

    return (
      <p>
        {project ? (
          <span>
            Redirected to <a href={project.demo}>{project.demo}</a>
          </span>
        ) : (
          "Error: Project not found"
        )}
      </p>
    );
  }
  //
  else if (cdSocial) {
    const social = socialMediaLinks.find(
      ({ name }) => formatTitle(name) === userQuestion.split(" ")[1]
    );

    return (
      <p>
        {social ? (
          <span>
            Redirected to <a href={social.href}>{social.href}</a>
          </span>
        ) : (
          "Error: Social handle not found"
        )}
      </p>
    );
  }

  const trimmedQuestion = userQuestion.trim();
  if (trimmedQuestion === "clear") {
    clearArrayText();
    return null;
  }

  const [baseCommand] = trimmedQuestion.split(/\s+/);

  const isQuestionExist = CommandLineFunctions.find(
    ({ functions, shortcut }) =>
      functions === baseCommand || shortcut === baseCommand
  );

  if (isQuestionExist) {
    const description = isQuestionExist.description;
    const isCustomComponent = React.isValidElement(description) && typeof description.type === "function";

    return (
      <div key={userQuestion}>
        {isCustomComponent
          ? React.cloneElement(description as React.ReactElement<any>, {
              userQuestion,
            })
          : description}
      </div>
    );
  }

  return <p>bash: "{userQuestion}" command not found</p>;
};
