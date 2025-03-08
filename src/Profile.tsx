import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "./axiom";
import { useLocation } from "react-router-dom";

const Profile: React.FC = () => {
  // {"appuser_name":{"firstname":"Harry","lastname":"Potter"},"aboutme":"I'm a good person","citytown":"London","country":"UK","age":20,"gender":"M","organisation_details":{"name":"Microsoft Corporation","description":"Technology company"}}
  interface AppUserName {
    firstname: string | null;
    lastname: string | null;
  }

  interface OrganisationDetails {
    name: string | null;
    description: string | null;
  }

  interface ProfileData {
    appuser_name: AppUserName;
    aboutme: string | null;
    citytown: string | null;
    country: string | null;
    age: number | null;
    gender: "M" | "F" | "NA";
    organisation_details: OrganisationDetails;
  }

  //actualy profile data in the database
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  //data that may be submitted to change the profile data
  const [editProfileData, setEditProfileData] = useState<ProfileData | null>(
    null
  );

  const [edit, setEdit] = useState<Boolean>(false);

  useEffect(() => {
    const user_id = localStorage.get("user_id");

    axiosInstance
      .get(`showprofile/${user_id}`)
      .then((response) => {
        console.log("showprofile API success!");
        setProfileData(response.data);
        setEditProfileData(response.data);
      })
      .catch((error) => {
        console.error("showprofile API failed", error);
      });
  }, []);

  //remember change event can be either text area(edit) or input
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    //data structure:
    // {"appuser_name":{"firstname":"Harry","lastname":"Potter"},"aboutme":"I'm a good person","citytown":"London","country":"UK","age":20,"gender":"M","organisation_details":{"name":"Microsoft Corporation","description":"Technology company"}}

    const { name, value } = event.target;

    if (name == "firstname" || name == "lastname") {
      // key = {appuser_name: name}
      setEditProfileData((prevEditProfileData) => {
        //we need this if condition as prevEditProfile could be null, if its null, trying to access a key will throw an error!
        if (!prevEditProfileData) {
          return prevEditProfileData;
        }
        return {
          ...prevEditProfileData,
          appuser_name: {
            //need to use ...prevEditProfileData.appuser_name as we need to preserve everything else in appuser_name that doesn't require change! because the appuser_name's associated value is also an object!
            ...prevEditProfileData.appuser_name,
            [name]: value,
          },
        };
      });
    } else {
      setEditProfileData((prevEditProfileData) => {
        if (!prevEditProfileData) {
          return prevEditProfileData;
        }
        return {
          ...prevEditProfileData,
          [name]: value,
        };
      });
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    //prevent default behaviour of reloading page after submission
    event.preventDefault();

    axiosInstance
      .post("updateprofile/", { editProfileData })
      .then((response) => {
        console.log("updateprofile API success!");
        setProfileData(response.data);
        setEditProfileData(response.data);
      })
      .catch((error) => {
        console.error("updateprofile API failed", error);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>First Name:</label>
        {edit ? (
          <input
            type="text"
            name="firstname"
            value={editProfileData?.appuser_name.firstname ?? ""}
            onChange={handleChange}
          ></input>
        ) : (
          <span>{profileData?.appuser_name.firstname}</span>
        )}
      </div>
      <div>
        <label>Last Name:</label>
        {edit ? (
          <input
            type="text"
            name="lastname"
            value={editProfileData?.appuser_name.lastname ?? ""}
            onChange={handleChange}
          ></input>
        ) : (
          <span>{profileData?.appuser_name.lastname}</span>
        )}
      </div>
      <div>
        <label>About me:</label>
        {edit ? (
          <input
            type="text"
            name="aboutme"
            value={editProfileData?.aboutme ?? ""}
            onChange={handleChange}
          ></input>
        ) : (
          <span>{profileData?.aboutme}</span>
        )}
      </div>
      <div>
        <label>City/Town:</label>
        {edit ? (
          <input
            type="text"
            name="citytown"
            value={editProfileData?.citytown ?? ""}
            onChange={handleChange}
          ></input>
        ) : (
          <span>{profileData?.citytown}</span>
        )}
      </div>

      <div>
        <label>Country:</label>
        {edit ? (
          <input
            type="text"
            name="country"
            value={editProfileData?.country ?? ""}
            onChange={handleChange}
          ></input>
        ) : (
          <span>{profileData?.country}</span>
        )}
      </div>

      <div>
        <label>Age:</label>
        {edit ? (
          <input
            type="text"
            name="age"
            value={editProfileData?.age ?? ""}
            onChange={handleChange}
          ></input>
        ) : (
          <span>{profileData?.age}</span>
        )}
      </div>

      <div>
        <label>Gender:</label>
        {edit ? (
          <select
            name="gender"
            //if editProfileData is indeed null, the expression editProfileData?.gender || "" evaluates to "" <--empty string
            value={editProfileData?.gender}
            onChange={handleChange}
          >
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="NA">Unspecified</option>
          </select>
        ) : (
          <span>{profileData?.gender}</span>
        )}
      </div>
    </form>
  );
};

export default Profile;
