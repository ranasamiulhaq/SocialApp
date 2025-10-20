import React from 'react';
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useEffect, useState } from "react";

// Feed Item Example Response
//  {
//         "id": 1,
//         "user_id": 4,
//         "title": "My First Post",
//         "description": "My First Post My First Post My First Post My First Post",
//         "created_at": "2025-10-20T05:45:52.000000Z",
//         "updated_at": "2025-10-20T05:45:52.000000Z",
//         "user": {
//             "id": 4,
//             "name": "Rana Sami Ul Haq",
//             "email": "sami@gmail.com",
//             "email_verified_at": null,
//             "created_at": "2025-10-16T07:57:30.000000Z",
//             "updated_at": "2025-10-16T07:57:30.000000Z"
//         }
//     }

const Feed = () => {
  const axiosPrivate = useAxiosPrivate();
  const [feedData, setFeedData] = useState(null);

  useEffect(() => { 
    const fetchFeed = async () => {
      try {
        const response = await axiosPrivate.get('/feed');
        console.log("Feed Data:", response.data);
        setFeedData(response.data);
      } catch (err) {
        console.error("Error fetching feed data:", err);
      }
    };

    fetchFeed();
  }, []);

  return (
    <div>
        <h1 className='text-2xl font-bold '> Feed </h1>
      {feedData ? (
        feedData.map(item => (
          <div key={item.id}>
            <h2>{item.user.name}</h2>
            <p>{item.user.email}</p>
            <p>Posted on: {new Date(item.created_at).toLocaleDateString()}</p>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <br/>
          </div>
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Feed;
