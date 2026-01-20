import "./Card.css";

function Card({ title, content, isLoading, children, style }) {
  return (
    <div className="card" style={style}>
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
