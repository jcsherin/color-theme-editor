import { useState, useEffect } from "react";

export function useFocusTextInput(
  containerRef: React.RefObject<HTMLDivElement>
) {
  const [isFocusTextInput, setFocusTextInput] = useState(false);

  useEffect(() => {
    function handleRenameInputFocus(event: MouseEvent) {
      if (
        containerRef &&
        containerRef.current &&
        containerRef.current.contains(event.target as Node)
      ) {
        setFocusTextInput(true);
      } else {
        setFocusTextInput(false);
      }
    }

    document.addEventListener("mousedown", handleRenameInputFocus);
    return () =>
      document.removeEventListener("mousedown", handleRenameInputFocus);
  }, [containerRef]);

  return isFocusTextInput;
}
