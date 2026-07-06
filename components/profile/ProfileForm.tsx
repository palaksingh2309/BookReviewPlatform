"use client";

export default function ProfileForm() {
  return (
    <form>
      <div>
        <label htmlFor="username">Username</label>
        <input id="username" type="text" />
      </div>

      <div>
        <label htmlFor="fullName">Full Name</label>
        <input id="fullName" type="text" />
      </div>

      <div>
        <label htmlFor="bio">Bio</label>
        <textarea id="bio" rows={4}></textarea>
      </div>

      <div>
        <label htmlFor="favoriteGenre">Favorite Genre</label>
        <input id="favoriteGenre" type="text" />
      </div>

      <button type="submit">Save Profile</button>
    </form>
  );
}