import "./Card.css";

function Card({ title, content, isLoading, children }) {
  return (
    <div className="card">
      {isLoading ? (
        <div className="spinner" />
      ) : (
        <>
          {title && <h2 className="card-title">{title}</h2>}
          {content && <p className="card-content">{content}</p>}
          {children}
        </>
      )}
    </div>
  );
}

export default Card;
