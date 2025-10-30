import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AOS from "aos";
import "./Feed.css";
import "aos/dist/aos.css";

const Feed = () => {
  useEffect(() => {
    AOS.init({
      duration: 300,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);

  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("userName");

    if (!token) {
      navigate("/");
      return;
    }

    setUserName(name);
    fetchPosts();
  }, [navigate]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(
        "https://linkedin-backend-kzfo.onrender.com/api/posts/all"
      );
      setPosts(res.data);
    } catch (err) {
      setError("Failed to load posts");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError("");

    if (!content.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("content", content);

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      await axios.post(
        "https://linkedin-backend-kzfo.onrender.com/api/posts/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setContent("");
      removeImage();
      fetchPosts();
    } catch (err) {
      setError("Failed to create post");
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://linkedin-backend-kzfo.onrender.com/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPosts();
    } catch (err) {
      console.error("Failed to like post");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/");
  };

  const formatDate = (date) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  return (
    <div className="feed-container">
      <header className="navbar" data-aos="fade-down">
        <h1>LinkedIn </h1>
        <div className="user-info">
          <span>Welcome, {userName}</span>
          <button onClick={() => navigate("/profile")} className="profile-btn">
            Profile
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="feed-content" data-aos="fade-up" data-aos-delay="300">
        <div className="create-post-card">
          <h2>Create a Post</h2>
          {error && <div className="error">{error}</div>}

          <form onSubmit={handleCreatePost}>
            <textarea
              data-aos="fade-up"
              data-aos-delay="400"
              placeholder="What do you want to talk about?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="4"
              required
            />

            {imagePreview && (
              <div
                className="image-preview"
                data-aos="fade-up"
                data-aos-delay="600"
              >
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="remove-image"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="post-actions">
              <label htmlFor="image-upload" className="image-upload-btn">
                📷 Add Photo
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              <button type="submit">Post</button>
            </div>
          </form>
        </div>

        <div className="posts-section">
          <h2>Feed</h2>
          {posts.length === 0 ? (
            <p className="no-posts">No posts yet. Be the first to post!</p>
          ) : (
            posts.map((post) => (
              <div
                key={post._id}
                className="post-card"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <div className="post-header">
                  <div className="post-author">
                    {post.userProfilePicture ? (
                      <img
                        src={`http://localhost:5000${post.userProfilePicture}`}
                        alt={post.userName}
                        className="avatar-img"
                      />
                    ) : (
                      <div className="avatar">
                        {post.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3>{post.userName}</h3>
                      <p className="post-date">{formatDate(post.createdAt)}</p>
                    </div>
                  </div>
                </div>
                <div className="post-content">
                  <p>{post.content}</p>
                  {post.imageUrl && (
                    <img
                      src={`http://localhost:5000${post.imageUrl}`}
                      alt="Post content"
                      className="post-image"
                    />
                  )}
                </div>
                <div className="post-interactions">
                  <button
                    data-aos="fade-up"
                    data-aos-delay="400"
                    onClick={() => handleLike(post._id)}
                    className={`like-btn ${
                      post.likes?.length > 0 ? "liked" : ""
                    }`}
                  >
                    👍 {post.likes?.length || 0} Likes
                  </button>
                  <span
                    className="comment-count"
                    data-aos="fade-up"
                    data-aos-delay="400"
                  >
                    💬 {post.comments?.length || 0} Comments
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
