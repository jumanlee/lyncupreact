import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "./axiom";
import { useLocation } from "react-router-dom";

const Profile: React.FC = () => {
  // interface OrganisationDetails {
  //   name: string | null;
  //   id: number | null;
  // }

  interface ProfileData {
    firstname: string | null;
    lastname: string | null;
    aboutme: string | null;
    citytown: string | null;
    country: string | null;
    age: number | null;
    gender: "M" | "F" | "NA";
    organisation_id: number | null;
    organisation_name: string | null;
  }

  //actualy profile data in the database
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  //data that may be submitted to change the profile data
  const [editProfileData, setEditProfileData] = useState<ProfileData | null>(
    null
  );

  const [edit, setEdit] = useState<boolean>(false);

  //for organisation search input
  const [searchQuery, setSearchQuery] = useState<string>("");
  //for showing suggested companies
  const [suggestions, setSuggestions] = useState<
    { id: number; name: string }[]
  >([]);
  //for dropdown the suggested companies
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  //to track clicks outside for closing the orgnaisation search dropdown
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");

    axiosInstance
      .get(`users/showprofile/${user_id}`)
      .then((response) => {
        console.log("showprofile API success!");
        setProfileData(response.data);
        setEditProfileData(response.data);
      })
      .catch((error) => {
        console.error("showprofile API failed", error);
      });
  }, []);

  //get matching companies as user is typing
  const handleSearchOrgChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    axiosInstance
      .get(`/updateprofile/searchorg/?q=${query}`)
      .then((response) => {
        setSuggestions(response.data);
        setShowSuggestions(true);
      })
      .catch((error) => console.error("search query failed", error));
  };

  const handleSelectOrg = (org: { id: number; name: string }) => {
    setEditProfileData((prevEditProfileData) => {
      if (!prevEditProfileData) {
        return prevEditProfileData;
      }
      return {
        ...prevEditProfileData,
        organisation_id: org.id,
        organisation_name: org.name,
      };
    });

    setSearchQuery(org.name);
    setSuggestions([]); //hide dropdown
    setShowSuggestions(false);
  };

  //event listener to control search org clicking outside close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    //cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  //remember change event can be either text area(edit) or input
  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    //data structure:
    // {"firstname":"Harry","lastname":"Potter","aboutme":"I'm a good person","citytown":"London","country":"UK","age":20,"gender":"M", organisation_id: 5, organisation_name: "Disney"}

    const { name, value } = event.target;

    setEditProfileData((prevEditProfileData) => {
      if (!prevEditProfileData) {
        return prevEditProfileData;
      }
      return {
        ...prevEditProfileData,
        [name]: value,
      };
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    //prevent default behaviour of reloading page after submission
    event.preventDefault();

    //Don't send {editProfileData}, send editProfileData as Django serializer expects the fields at the root level, not inside an "editProfileData" object!
    axiosInstance
      .put("users/updateprofile/", editProfileData)
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
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name: </label>
          {edit ? (
            <input
              type="text"
              name="firstname"
              value={editProfileData?.firstname ?? ""}
              onChange={handleChange}
            ></input>
          ) : (
            <span>{profileData?.firstname}</span>
          )}
        </div>
        <div>
          <label>Last Name: </label>
          {edit ? (
            <input
              type="text"
              name="lastname"
              value={editProfileData?.lastname ?? ""}
              onChange={handleChange}
            ></input>
          ) : (
            <span>{profileData?.lastname}</span>
          )}
        </div>
        <div>
          <label>About me: </label>
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
          <label>City/Town: </label>
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
          <label>Country: </label>
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
          <label>Age: </label>
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
          <label>Gender: </label>
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
        <div>
          <label>Organisation: </label>
          {edit ? (
            <div ref={inputRef}>
              <input
                type="text"
                name="organisation_name"
                value={searchQuery}
                onChange={handleSearchOrgChange}
                placeholder="Search for a company..."
                onFocus={() => setShowSuggestions(true)}
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul>
                  {suggestions.map((org) => (
                    <li key={org.id} onClick={() => handleSelectOrg(org)}>
                      {org.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <span>{profileData?.organisation_name}</span>
          )}
        </div>
        <button type="submit">Submit</button>
      </form>
      <div>
        {edit ? (
          <button onClick={() => setEdit(false)}>Cancel</button>
        ) : (
          <button onClick={() => setEdit(true)}>Edit</button>
        )}
      </div>
    </>
  );
};

export default Profile;
