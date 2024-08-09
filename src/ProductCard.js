import React, { useState, useEffect } from 'react';
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { v4 as uuidv4 } from 'uuid';

function ProductCard({ product }) {
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [sortBy, setSortBy] = useState(null); // Состояние для сортировки

  useEffect(() => {
    const storedLikes = localStorage.getItem(`likes-${product.id}`);
    if (storedLikes) {
      setLikes(parseInt(storedLikes, 10));
    }

    const storedIsLiked = localStorage.getItem(`liked-${product.id}`);
    if (storedIsLiked) {
      setIsLiked(storedIsLiked === 'true');
    }

    const storedComments = localStorage.getItem(`comments-${product.id}`);
    if (storedComments) {
      setComments(JSON.parse(storedComments));
    }
  }, [product.id]);

  // Обработка лайков
  const handleLikeClick = () => {
    setLikes(likes + (isLiked ? -1 : 1));
    localStorage.setItem(`likes-${product.id}`, likes + (isLiked ? -1 : 1));
    setIsLiked(!isLiked);
    localStorage.setItem(`liked-${product.id}`, !isLiked);
  };

  // Добавление комментария
  const handleCommentSubmit = (event) => {
    event.preventDefault();
    const newComment = event.target.comment.value.trim();
    if (newComment) {
      const newCommentWithId = {
        id: uuidv4(), // Добавляем уникальный ID для каждого комментария
        text: newComment,
        date: new Date().toLocaleString(), // Добавляем дату создания комментария
        likes: 0, // Инициализируем лайки для нового комментария
        replies: [], // Инициализируем массив ответов для нового комментария
      };

      setComments([...comments, newCommentWithId]);
      localStorage.setItem(`comments-${product.id}`, JSON.stringify([...comments, newCommentWithId]));
      event.target.comment.value = ''; // Очищаем поле ввода
    }
  };

  // Удаление комментария
  const handleCommentDelete = (commentId) => {
    const updatedComments = comments.filter((comment) => comment.id !== commentId);
    setComments(updatedComments);
    localStorage.setItem(`comments-${product.id}`, JSON.stringify(updatedComments));
  };

  // Редактирование комментария
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  const handleEditComment = (commentId) => {
    setEditingCommentId(commentId);
    setEditingCommentText(comments.find((comment) => comment.id === commentId).text);
  };

  const handleSaveEdit = (commentId) => {
    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        return { ...comment, text: editingCommentText };
      }
      return comment;
    });
    setComments(updatedComments);
    localStorage.setItem(`comments-${product.id}`, JSON.stringify(updatedComments));
    setEditingCommentId(null);
  };

  // Лайки для комментариев
  const handleCommentLikeClick = (commentId) => {
    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: (comment.likes || 0) + 1, // Увеличиваем лайки для комментария
        };
      }
      return comment;
    });
    setComments(updatedComments);
    localStorage.setItem(`comments-${product.id}`, JSON.stringify(updatedComments));
  };

  // Ответ на комментарий
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = (commentId) => {
    const newReply = {
      id: uuidv4(),
      text: replyText,
      date: new Date().toLocaleString(),
      replyTo: commentId,
    };

    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: (comment.replies || []).concat(newReply),
        };
      }
      return comment;
    });

    setComments(updatedComments);
    localStorage.setItem(`comments-${product.id}`, JSON.stringify(updatedComments));
    setReplyingTo(null);
    setReplyText('');
  };

  const handleReplyChange = (event) => {
    setReplyText(event.target.value);
  };

  // Сортировка комментариев
  const handleSortByChange = (event) => {
    setSortBy(event.target.value);
  };

  const sortedComments = sortBy
  ? comments.slice().sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date); // Сортировка по дате (по убыванию)
      } else if (sortBy === 'likes') {
        return (b.likes || 0) - (a.likes || 0); // Сортировка по лайкам (по убыванию)
      } 
      // Добавьте `return 0`  в случае, если `sortBy` не соответствует ни одному условию
      return 0; 
    })
  : comments;

  return (
    <div className="product-card">
      <img src={product.imageUrl} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <div className="likes">
        <button onClick={handleLikeClick}>
          {isLiked ? <FaHeart className='faheart active' /> : <FaRegHeart className='faheart' />} 
        </button>
        <span>{likes}</span>
      </div>

      <h2>Комментарии</h2>
      <div className="sort-options">
        <label htmlFor="sort-by">Сортировать по:</label>
        <select id="sort-by" value={sortBy} onChange={handleSortByChange}>
          <option value={null}>Без сортировки</option>
          <option value="date">Дате</option>
          <option value="likes">Лайкам</option>
        </select>
      </div>
      <ul>
        {sortedComments.map((comment) => (
          <li key={comment.id} className="comment">
            {/* Аватар пользователя */}
            <img src="https://example.com/user-avatar.png" alt="Аватар" className="comment-avatar" />

            {/* Текст комментария */}
            {editingCommentId === comment.id ? (
              <form onSubmit={() => handleSaveEdit(comment.id)}>
                <input
                  type="text"
                  value={editingCommentText}
                  onChange={(e) => setEditingCommentText(e.target.value)}
                />
                <button type="submit">Сохранить</button>
              </form>
            ) : (
              <span>{comment.text}</span>
            )}

            {/* Дата комментария */}
            <span className="comment-date">{comment.date}</span>

            {/* Лайки для комментария */}
            <button onClick={() => handleCommentLikeClick(comment.id)}>
              {comment.likes ? (
                <FaHeart className='faheart active' /> 
              ) : (
                <FaRegHeart className='faheart' />
              )}
              {comment.likes ? ` ${comment.likes}` : ''}
            </button>

            {/* Ответ на комментарий */}
            {replyingTo === comment.id ? (
              <form onSubmit={() => handleReplySubmit(comment.id)}>
                <input
                  type="text"
                  value={replyText}
                  onChange={handleReplyChange}
                  placeholder="Написать ответ..."
                />
                <button type="submit">Отправить</button>
              </form>
            ) : (
              <button onClick={() => setReplyingTo(comment.id)}>Ответить</button>
            )}

            {/* Отображение ответов */}
            {comment.replies && comment.replies.length > 0 && (
              <ul className="replies">
                {comment.replies.map((reply) => (
                  <li key={reply.id} className="reply">
                    <span>{reply.text}</span>
                    <span className="comment-date">{reply.date}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Кнопки редактирования и удаления */}
            <button onClick={() => handleEditComment(comment.id)}>Редактировать</button>
            <button onClick={() => handleCommentDelete(comment.id)}>Удалить</button>
          </li>
        ))}
      </ul>

      {/* Форма добавления комментария */}
      <form onSubmit={handleCommentSubmit}>
        <input type="text" name="comment" placeholder="Добавить комментарий" />
        <button type="submit">Отправить</button>
      </form>
    </div>
  );
}

export default ProductCard;