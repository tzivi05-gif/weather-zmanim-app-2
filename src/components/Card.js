function Card({ title, content }) {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      margin: '10px',
      backgroundColor: '#f9f9f9'
    }}>
      <h2>{title}</h2>
      <p>{content}</p>
    </div>
  );
}

export default Card;