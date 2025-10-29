import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", bio: "", headline: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    fetchProfile();
  }, [userId, navigate]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = userId
        ? `https://linkedin-backend-kzfo.onrender.com/api/profile/${userId}`
        : `https://linkedin-backend-kzfo.onrender.com/api/profile/me/details`;

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(res.data);
      setEditData({
        name: res.data.name,
        bio: res.data.bio || "",
        headline: res.data.headline || "",
      });

      // Check if this is the current user's profile
      const currentUserResponse = await axios.get(
        "https://linkedin-backend-kzfo.onrender.com/api/profile/me/details",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsOwnProfile(currentUserResponse.data._id === res.data._id);

      // Check if already following
      if (!isOwnProfile && res.data.followers) {
        setIsFollowing(
          res.data.followers.some((f) => f._id === currentUserResponse.data._id)
        );
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to load profile");
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "https://linkedin-backend-kzfo.onrender.com/api/profile/update",
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("profilePicture", file);

      await axios.post(
        "https://linkedin-backend-kzfo.onrender.com/api/profile/upload-picture",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      fetchProfile();
    } catch (err) {
      setError("Failed to upload profile picture");
    }
  };

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem("token");
      if (isFollowing) {
        await axios.delete(
          `https://linkedin-backend-kzfo.onrender.com/api/follow/${profile._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `https://linkedin-backend-kzfo.onrender.com/api/follow/${profile._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setIsFollowing(!isFollowing);
      fetchProfile();
    } catch (err) {
      setError("Failed to update follow status");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profile) return <div className="error">Profile not found</div>;

  return (
    <div className="profile-container">
      <header className="navbar">
        <h1>LinkedIn Clone</h1>
        <button onClick={() => navigate("/feed")} className="back-btn">
          Back to Feed
        </button>
      </header>

      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-picture-section">
            {profile.profilePicture ? (
              <img
                src={`http://localhost:5000${profile.profilePicture}`}
                alt={profile.name}
                className="profile-picture"
              />
            ) : (
              <div className="profile-avatar">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
            {isOwnProfile && (
              <label htmlFor="profile-pic-upload" className="upload-btn">
                Change Photo
              </label>
            )}
            <input
              id="profile-pic-upload"
              type="file"
              accept="image/*"
              onChange={handleProfilePictureUpload}
              style={{ display: "none" }}
            />
          </div>

          <div className="profile-info">
            {!isEditing ? (
              <>
                <h2>{profile.name}</h2>
                <p className="headline">{profile.headline || "No headline"}</p>
                <p className="bio">{profile.bio || "No bio added yet"}</p>
                <div className="stats">
                  <span>{profile.followers?.length || 0} Followers</span>
                  <span>{profile.following?.length || 0} Following</span>
                </div>
                {isOwnProfile ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="edit-btn"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={handleFollow}
                    className={`follow-btn ${isFollowing ? "following" : ""}`}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>
                )}
              </>
            ) : (
              <form onSubmit={handleUpdateProfile} className="edit-form">
                <input
                  type="text"
                  placeholder="Name"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Headline"
                  value={editData.headline}
                  onChange={(e) =>
                    setEditData({ ...editData, headline: e.target.value })
                  }
                />
                <textarea
                  placeholder="Bio"
                  value={editData.bio}
                  onChange={(e) =>
                    setEditData({ ...editData, bio: e.target.value })
                  }
                  rows="4"
                />
                <div className="edit-actions">
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {(profile.followers?.length > 0 || profile.following?.length > 0) && (
          <div className="connections-section">
            {profile.followers?.length > 0 && (
              <div className="connections-list">
                <h3>Followers</h3>
                <div className="user-list">
                  {profile.followers.map((user) => (
                    <div
                      key={user._id}
                      className="user-item"
                      onClick={() => navigate(`/profile/${user._id}`)}
                    >
                      {user.profilePicture ? (
                        <img
                          src={`http://localhost:5000${user.profilePicture}`}
                          alt={user.name}
                        />
                      ) : (
                        <div className="small-avatar">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>{user.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile.following?.length > 0 && (
              <div className="connections-list">
                <h3>Following</h3>
                <div className="user-list">
                  {profile.following.map((user) => (
                    <div
                      key={user._id}
                      className="user-item"
                      onClick={() => navigate(`/profile/${user._id}`)}
                    >
                      {user.profilePicture ? (
                        <img
                          src={`http://localhost:5000${user.profilePicture}`}
                          alt={user.name}
                        />
                      ) : (
                        <div className="small-avatar">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>{user.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
