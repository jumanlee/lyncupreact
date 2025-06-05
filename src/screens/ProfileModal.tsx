import React from "react";

export interface ProfileData {
  user_id: number;
  firstname: string | null;
  lastname: string | null;
  aboutme: string | null;
  country_name: string | null;
  age: number | null;
  gender: "M" | "F" | "NA";
  organisation_id: number | null;
  organisation_name: string | null;
}

interface ProfileModalProps {
  profile: ProfileData;

  //this means must give me a function that takes no input and returns nothing
  //e.g. if we have () => setSelectedProfile(null), it takes no input and returns nothing (cuz setSelectedProfile(null) doesn’t return anything useful)
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ profile, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-80">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {profile.firstname} {profile.lastname}
          </h2>
          <button onClick={onClose} className="text-red-500 text-lg">
            X
          </button>
        </div>
        <p>
          <strong>About Me:</strong> {profile.aboutme || "N/A"}
        </p>
        <p>
          <strong>Location:</strong> {profile.country_name || "N/A"}
        </p>
        <p>
          <strong>Age:</strong> {profile.age || "N/A"}
        </p>
        <p>
          <strong>Gender:</strong> {profile.gender}
        </p>
        <p>
          <strong>Organisation:</strong> {profile.organisation_name || "N/A"}
        </p>
      </div>
    </div>
  );
};

export default ProfileModal;
