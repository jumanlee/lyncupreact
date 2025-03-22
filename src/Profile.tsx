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

  //searchTimeout is for tracking typing on org search bar to prevent overwhelming backend as user types. setTimeout is a global built in function. note ReturnType<...> is a built-in typescrpit utility type that extracts the return type from any given function type. Note that setTimeout is a function! typeof means go get the type of this variable or function. This is for if the setTimeout return type ever changes (rarely, but possible in some custom environments).
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");

    axiosInstance
      .get(`users/showprofile/${user_id}`)
      .then((response) => {
        console.log("showprofile API success!");
        setProfileData(response.data);
        setEditProfileData(response.data);
        //to protect against sending null organisation when the user doesn't intend it.
        setSearchQuery(response.data.organisation_name || "");
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

    //searchTimeout stores the id of a setTimeout that delays the organisation search API call by a specified time. If the user types again within that time, the timer is cancelled to prevent sending an outdated request
    if (searchTimeout) {
      //clearTimeout is a built-in.
      clearTimeout(searchTimeout);
    }

    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeout = setTimeout(() => {
      axiosInstance
        .get(`users/searchorg/?q=${query}`)
        .then((response) => {
          setSuggestions(response.data);
          setShowSuggestions(true);
        })
        .catch((error) => console.error("search query failed", error));
    }, 300);

    setSearchTimeout(timeout);
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

    setSearchQuery("");
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

  //To handle field changes, fields that are not search org bar. Remember change event can be either text area(edit) or input
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    //data structure:
    // {"firstname":"Harry","lastname":"Potter","aboutme":"I'm a good person","citytown":"London","country":"UK","age":20,"gender":"M", organisation_id: 5, organisation_name: "Disney"}

    const { name, value } = event.target;

    setEditProfileData((prevEditProfileData) => {
      if (!prevEditProfileData) {
        return prevEditProfileData;
      }

      if (name === "age") {
        const ageInt = parseInt(value);
        return {
          ...prevEditProfileData,
          [name]: Number.isNaN(ageInt) ? null : ageInt,
        };
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
        setEdit(false);
      })
      .catch((error) => {
        console.error("updateprofile API failed", error);
      });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-gray-800 text-gray-200 p-6 rounded shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-gray-400 font-semibold">My Profile</h2>
          {edit ? (
            <button
              onClick={() => setEdit(false)}
              className="bg-[#4b1e1e] text-gray-200 font-semibold py-2 px-4 rounded focus:outline-none"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => setEdit(true)}
              className="bg-[#4b1e1e]  text-gray-200 font-semibold py-2 px-4 rounded focus:outline-none"
            >
              Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            {/* htmlFor is just a way to connect a label to an input */}
            <label className="block mb-1 text-gray-400 font-semibold" htmlFor="firstname">
              First Name:{" "}
            </label>
            {edit ? (
              <input
                id="firstname"
                autoComplete="off"
                type="text"
                name="firstname"
                value={editProfileData?.firstname ?? ""}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500"
              ></input>
            ) : (
              <div className="px-2 py-1 bg-gray-700 rounded">
                {profileData?.firstname ?? ""}
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-400 font-semibold" htmlFor="lastname">
              Last Name:{" "}
            </label>
            {edit ? (
              <input
                id="lastname"
                autoComplete="off"
                type="text"
                name="lastname"
                value={editProfileData?.lastname ?? ""}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500"
              ></input>
            ) : (
              <div className="px-2 py-1 bg-gray-700 rounded">
                {profileData?.lastname ?? ""}
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-400 font-semibold" htmlFor="aboutme">
              About me:{" "}
            </label>
            {edit ? (
              <input
                id="aboutme"
                autoComplete="off"
                type="text"
                name="aboutme"
                value={editProfileData?.aboutme ?? ""}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500"
              ></input>
            ) : (
              <div className="px-2 py-1 bg-gray-700 rounded">
                {profileData?.aboutme ?? ""}
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-400 font-semibold" htmlFor="citytown">
              City/Town:{" "}
            </label>
            {edit ? (
              <input
                id="citytown"
                autoComplete="off"
                type="text"
                name="citytown"
                value={editProfileData?.citytown ?? ""}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500"
              ></input>
            ) : (
              <div className="px-2 py-1 bg-gray-700 rounded">
                {profileData?.citytown ?? ""}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-gray-400 font-semibold" htmlFor="country">
              Country:{" "}
            </label>
            {edit ? (
              <input
                id="country"
                autoComplete="off"
                type="text"
                name="country"
                value={editProfileData?.country ?? ""}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500"
              ></input>
            ) : (
              <div className="px-2 py-1 bg-gray-700 rounded">
                {profileData?.country ?? ""}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-gray-400 font-semibold" htmlFor="age">
              Age:{" "}
            </label>
            {edit ? (
              <input
                id="age"
                autoComplete="off"
                type="text"
                name="age"
                value={editProfileData?.age ?? ""}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500"
              ></input>
            ) : (
              <div className="px-2 py-1 bg-gray-700 rounded">
                {profileData?.age ?? ""}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-gray-400 font-semibold" htmlFor="gender">
              Gender:{" "}
            </label>
            {edit ? (
              <select
                id="gender"
                name="gender"
                //if editProfileData is indeed null, the expression editProfileData?.gender || "" evaluates to "" <--empty string
                value={editProfileData?.gender}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="NA">Unspecified</option>
              </select>
            ) : (
              <div className="px-2 py-1 bg-gray-700 rounded">
                {profileData?.gender ?? ""}
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-400 font-semibold" htmlFor="organisation">
              Organisation:{" "}
            </label>
            {edit ? (
              <div className="relative" ref={inputRef}>
              <div className="px-2 py-1 mb-2 bg-gray-700 rounded">
                {editProfileData?.organisation_name ?? ""}
              </div>
                <input
                  id="organisation"
                  autoComplete="off"
                  type="text"
                  name="organisation_name"
                  value={searchQuery}
                  onChange={handleSearchOrgChange}
                  placeholder="Search for a company..."
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute z-10 bg-gray-700 border border-gray-600 mt-1 w-full rounded shadow-md">
                    {suggestions.map((org) => (
                      <li
                        key={org.id}
                        onClick={() => handleSelectOrg(org)}
                        className="px-2 py-1 hover:bg-gray-600 cursor-pointer"
                      >
                        {org.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="px-2 py-1 bg-gray-700 rounded">
                {profileData?.organisation_name ?? ""}
              </div>
            )}
          </div>
          {edit && (
          <button
            type="submit"
            className="bg-[#4b1e1e] text-gray-200 font-semibold py-2 px-4 rounded focus:outline-none"
          >
            Submit
          </button>)
}
        </form>
      </div>
    </div>
  );
};

export default Profile;
