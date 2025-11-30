import { useEffect } from "react";
import "./Toast.css";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <span className="toast-icon">
          {type === "success" ? "✓" : "✕"}
        </span>
        <span className="toast-message">{message}</span>
      </div>
    </div>
  );
}

