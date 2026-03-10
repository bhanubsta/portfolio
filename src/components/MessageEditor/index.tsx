import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import emailjs from "@emailjs/browser";
import { themeStore, zustandStore } from "utils/store";
import "./messageEditor.scss";

// ── EmailJS config ──────────────────────────────────────────────
// 1. Sign up free at https://www.emailjs.com
// 2. Add an Email Service (Gmail, Outlook, etc.)
// 3. Create an Email Template with variables: {{to_email}}, {{subject}}, {{message}}
// 4. Fill in your credentials below
const EMAILJS_SERVICE_ID  = "service_t4zcavt";
const EMAILJS_TEMPLATE_ID = "template_fsdynkk";
const EMAILJS_PUBLIC_KEY  = "PI-EM2j2uUpzh9WDm";
// ────────────────────────────────────────────────────────────────

type Pos = { line: number; col: number };

const posLte = (a: Pos, b: Pos) =>
  a.line < b.line || (a.line === b.line && a.col <= b.col);

const normalizeRange = (a: Pos, b: Pos) =>
  posLte(a, b) ? { start: a, end: b } : { start: b, end: a };

const deleteRange = (start: Pos, end: Pos, lines: string[]): { lines: string[]; pos: Pos } => {
  const next = [...lines];
  if (start.line === end.line) {
    next[start.line] = next[start.line].slice(0, start.col) + next[start.line].slice(end.col);
  } else {
    next[start.line] = next[start.line].slice(0, start.col) + next[end.line].slice(end.col);
    next.splice(start.line + 1, end.line - start.line);
  }
  return { lines: next, pos: start };
};

const insertAt = (text: string, pos: Pos, lines: string[]): { lines: string[]; pos: Pos } => {
  const next = [...lines];
  const chunks = text.split("\n");
  const before = next[pos.line].slice(0, pos.col);
  const after = next[pos.line].slice(pos.col);
  if (chunks.length === 1) {
    next[pos.line] = before + text + after;
    return { lines: next, pos: { line: pos.line, col: pos.col + text.length } };
  }
  next[pos.line] = before + chunks[0];
  const last = chunks[chunks.length - 1];
  next.splice(pos.line + 1, 0, ...chunks.slice(1, -1), last + after);
  return { lines: next, pos: { line: pos.line + chunks.length - 1, col: last.length } };
};

export const MessageEditor = () => {
  const {
    setIsEditorOpen,
    editorContent, setEditorContent,
    editorMetadata, setEditorMetadata,
    isSending, setIsSending,
    errorMessage, setErrorMessage,
  } = themeStore();

  const { setIsInputLocked } = zustandStore();

  const [cursorPos, setCursorPos] = useState<Pos>({ line: 0, col: 0 });
  const [feedback, setFeedback] = useState("");
  const [dragAnchor, setDragAnchor] = useState<Pos | null>(null);
  const [dragFocus, setDragFocus] = useState<Pos | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const charWidthRef = useRef<number>(0);

  // Measure monospace char width once on mount
  useEffect(() => {
    if (!editorRef.current) return;
    const el = document.createElement("span");
    el.style.cssText = "position:absolute;visibility:hidden;white-space:pre;font:inherit;font-size:14px";
    el.textContent = "x";
    editorRef.current.appendChild(el);
    charWidthRef.current = el.getBoundingClientRect().width;
    editorRef.current.removeChild(el);
  }, []);

  const selection = useMemo(() => {
    if (!dragAnchor || !dragFocus) return null;
    const { start, end } = normalizeRange(dragAnchor, dragFocus);
    if (start.line === end.line && start.col === end.col) return null;
    return { start, end };
  }, [dragAnchor, dragFocus]);

  const clearSelection = useCallback(() => {
    setDragAnchor(null);
    setDragFocus(null);
  }, []);

  const getPosFromEvent = useCallback((e: { clientX: number; clientY: number }): Pos | null => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const lineEl = el?.closest("[data-line-idx]") as HTMLElement | null;
    if (!lineEl) return null;
    const lineIdx = parseInt(lineEl.dataset.lineIdx!);
    const contentEl = lineEl.querySelector(".line-content") as HTMLElement;
    if (!contentEl) return { line: lineIdx, col: 0 };
    const rect = contentEl.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left);
    const cw = charWidthRef.current || 8.4;
    const col = Math.min(Math.round(x / cw), editorContent[lineIdx]?.length ?? 0);
    return { line: lineIdx, col };
  }, [editorContent]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("input, button")) return;
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const pos = getPosFromEvent(e);
    if (!pos) return;
    setIsDragging(true);
    setDragAnchor(pos);
    setDragFocus(pos);
    setCursorPos(pos);
  }, [getPosFromEvent]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const pos = getPosFromEvent(e);
    if (!pos) return;
    setDragFocus(pos);
    setCursorPos(pos);
  }, [isDragging, getPosFromEvent]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    const pos = getPosFromEvent(e);
    if (pos) {
      setDragFocus(pos);
      setCursorPos(pos);
      if (dragAnchor && pos.line === dragAnchor.line && pos.col === dragAnchor.col) {
        clearSelection();
      }
    }
  }, [isDragging, getPosFromEvent, dragAnchor, clearSelection]);

  // Release drag if mouse leaves window
  useEffect(() => {
    const onUp = () => setIsDragging(false);
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, []);

  const handleExit = useCallback(() => {
    setIsEditorOpen(false);
    setIsInputLocked(false);
    setFeedback("");
    setErrorMessage("");
  }, [setIsEditorOpen, setIsInputLocked, setErrorMessage]);

  const handleSend = useCallback(() => {
    if (!editorMetadata.to || !editorContent.join("").trim()) {
      setErrorMessage("Error: Recipient (To) and message body are required.");
      return;
    }
    setIsSending(true);
    setFeedback("Sending...");
    emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: editorMetadata.to,
        subject: editorMetadata.subject || "(no subject)",
        message: editorContent.join("\n"),
      },
      EMAILJS_PUBLIC_KEY
    ).then(() => {
      setFeedback("Message sent successfully! ✅");
      setTimeout(() => { handleExit(); setIsSending(false); }, 1500);
    }).catch(() => {
      setIsSending(false);
      setErrorMessage("Failed to send. Check your EmailJS credentials.");
      setFeedback("");
    });
  }, [editorMetadata, editorContent, setIsSending, setErrorMessage, handleExit]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isSending) return;

    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      if (e.key === "Escape" || e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        (e.target as HTMLElement).blur();
      }
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      if (e.key === "Enter") { e.preventDefault(); handleSend(); return; }
      if (e.key === "v") {
        e.preventDefault();
        navigator.clipboard.readText().then((text) => {
          if (!text) return;
          let lines = editorContent;
          let pos = cursorPos;
          if (selection) {
            const r = deleteRange(selection.start, selection.end, lines);
            lines = r.lines; pos = r.pos;
            clearSelection();
          }
          const r = insertAt(text, pos, lines);
          setEditorContent(r.lines);
          setCursorPos(r.pos);
        });
        return;
      }
      const blocked = ["s", "p", "f", "o", "n"];
      if (blocked.includes(e.key.toLowerCase())) { e.preventDefault(); return; }
    }

    if (e.key === "Escape") { handleExit(); return; }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      clearSelection();
      setCursorPos(prev => {
        if (prev.col > 0) return { ...prev, col: prev.col - 1 };
        if (prev.line > 0) return { line: prev.line - 1, col: editorContent[prev.line - 1].length };
        return prev;
      });
      return;
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      clearSelection();
      setCursorPos(prev => {
        if (prev.col < editorContent[prev.line].length) return { ...prev, col: prev.col + 1 };
        if (prev.line < editorContent.length - 1) return { line: prev.line + 1, col: 0 };
        return prev;
      });
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      clearSelection();
      setCursorPos(prev => {
        if (prev.line === 0) return prev;
        const l = prev.line - 1;
        return { line: l, col: Math.min(prev.col, editorContent[l].length) };
      });
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      clearSelection();
      setCursorPos(prev => {
        if (prev.line === editorContent.length - 1) return prev;
        const l = prev.line + 1;
        return { line: l, col: Math.min(prev.col, editorContent[l].length) };
      });
      return;
    }

    if (e.key === "Enter") {
      let lines = editorContent, pos = cursorPos;
      if (selection) {
        const r = deleteRange(selection.start, selection.end, lines);
        lines = r.lines; pos = r.pos; clearSelection();
      }
      const next = [...lines];
      next[pos.line] = next[pos.line].slice(0, pos.col);
      next.splice(pos.line + 1, 0, lines[pos.line].slice(pos.col));
      setEditorContent(next);
      setCursorPos({ line: pos.line + 1, col: 0 });
      return;
    }

    if (e.key === "Backspace") {
      if (selection) {
        const r = deleteRange(selection.start, selection.end, editorContent);
        setEditorContent(r.lines); setCursorPos(r.pos); clearSelection();
        return;
      }
      if (cursorPos.col === 0 && cursorPos.line === 0) return;
      const next = [...editorContent];
      if (cursorPos.col === 0) {
        const prev = next[cursorPos.line - 1];
        next[cursorPos.line - 1] = prev + next[cursorPos.line];
        next.splice(cursorPos.line, 1);
        setCursorPos({ line: cursorPos.line - 1, col: prev.length });
      } else {
        next[cursorPos.line] = next[cursorPos.line].slice(0, cursorPos.col - 1) + next[cursorPos.line].slice(cursorPos.col);
        setCursorPos({ ...cursorPos, col: cursorPos.col - 1 });
      }
      setEditorContent(next);
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      let lines = editorContent, pos = cursorPos;
      if (selection) {
        const r = deleteRange(selection.start, selection.end, lines);
        lines = r.lines; pos = r.pos; clearSelection();
      }
      const next = [...lines];
      next[pos.line] = next[pos.line].slice(0, pos.col) + e.key + next[pos.line].slice(pos.col);
      setEditorContent(next);
      setCursorPos({ ...pos, col: pos.col + 1 });
      return;
    }
  }, [editorContent, cursorPos, selection, isSending, handleSend, handleExit, insertAt, setEditorContent, clearSelection]);

  useEffect(() => {
    setIsInputLocked(true);
    return () => setIsInputLocked(false);
  }, [setIsInputLocked]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const renderLine = (line: string, lineIdx: number) => {
    const isCursorLine = cursorPos.line === lineIdx;
    const cursor = isCursorLine ? <span className="cursor" style={{ left: `${cursorPos.col}ch` }} /> : null;

    if (!selection || lineIdx < selection.start.line || lineIdx > selection.end.line) {
      return <>{line}{cursor}</>;
    }
    const s = lineIdx === selection.start.line ? selection.start.col : 0;
    const e = lineIdx === selection.end.line ? selection.end.col : line.length;
    return (
      <>
        {line.slice(0, s)}
        <span className="text-selected">{line.slice(s, e) || "\u00a0"}</span>
        {line.slice(e)}
        {cursor}
      </>
    );
  };

  return (
    <div
      className="TerminalOverlayEditor"
      ref={editorRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="Editor_Header">
        <span className="path">visitor@portfolio:~/messages$</span>
        <span className="file"> message.txt</span>
        <span className="close-btn" onClick={handleExit} title="Cancel & Exit">×</span>
      </div>

      <div className="Editor_Metadata">
        <div className="line">
          <span className="label">To:</span>
          <input
            type="text"
            value={editorMetadata.to}
            onChange={(e) => setEditorMetadata({ ...editorMetadata, to: e.target.value })}
            placeholder="bhanubista@gmail.com"
          />
        </div>
        <div className="line">
          <span className="label">Subject:</span>
          <input
            type="text"
            value={editorMetadata.subject}
            onChange={(e) => setEditorMetadata({ ...editorMetadata, subject: e.target.value })}
            placeholder="Hello from your portfolio"
          />
        </div>
        <div className="divider">-------------------------------------</div>
      </div>

      <div className="Editor_Body">
        {editorContent.map((line, idx) => (
          <div key={idx} className="Editor_Line" data-line-idx={idx}>
            <span className="line-number">{(idx + 1).toString().padStart(2, " ")}</span>
            <span className="line-content">{renderLine(line, idx)}</span>
          </div>
        ))}
      </div>

      <div className="Editor_Footer">
        <div className="status-bar">
          <span className="mode">-- TYPING --</span>
          <span className="info">
            {cursorPos.line + 1}:{cursorPos.col + 1} | {editorContent.length} lines
          </span>
        </div>
        <div className="action-bar">
          <button className="btn-cancel" onClick={handleExit} disabled={isSending}>Cancel</button>
          <button className="btn-send" onClick={handleSend} disabled={isSending}>
            {isSending ? "Opening..." : "Send"}
          </button>
        </div>
      </div>

      {feedback && <div className="Editor_Feedback">{feedback}</div>}
      {errorMessage && <div className="Editor_Error">{errorMessage}</div>}
    </div>
  );
};
