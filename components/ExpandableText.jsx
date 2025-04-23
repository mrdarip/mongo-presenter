import { useRef } from "react";

export default function ExpandableText({ text, maxLength = 100 }) {
  const dialogRef = useRef(null);
  const isLong = text.length > maxLength;
  const preview = isLong ? text.slice(0, maxLength) + "..." : text;

  const openDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  };

  const closeDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
  };

  return (
    <>
      <pre 
        onClick={openDialog}
        style={{ cursor: isLong ? "pointer" : "default", color: isLong ? "blue" : "inherit" , textDecoration: isLong ? "underline" : "inherit" }}
      >
        {preview}
      </pre>

      <dialog ref={dialogRef} style={styles.dialog}>
        <div style={styles.container}>
          <div style={styles.content}>{text}</div>
          <button onClick={closeDialog} style={styles.button}>Cerrar</button>
        </div>
      </dialog>
    </>
  );
}

const styles = {
  dialog: {
    width: "100vw",
    height: "100vh",
    margin: 0,
    padding: 0,
    border: "none",
    backgroundColor: "white",
  },
  container: {
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    boxSizing: "border-box"
  },
  content: {
    flex: 1,
    overflowY: "auto",
    whiteSpace: "pre-wrap",
    marginBottom: "1rem"
  },
  button: {
    alignSelf: "flex-end",
    padding: "0.5rem 1rem",
    fontSize: "1rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  }
};
