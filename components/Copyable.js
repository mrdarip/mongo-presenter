/**
 * Copyable component that allows users to copy the text on the children element to the clipboard.
 */
export default function Copyable({ text, children }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy: ', err);
    });
  };

    return (
        <span onClick={handleCopy} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
        {children}
        </span>
    );
    
}