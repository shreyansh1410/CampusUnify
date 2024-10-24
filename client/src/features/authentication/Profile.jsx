import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { app } from '../../firebase';

import { useDelete } from './useDelete';
import { useLogout } from './useLogout';
import { useUpdate } from './useUpdate';
import { useUser } from './useUser';

export default function Profile() {
  const { user } = useUser();
  const { logout } = useLogout();
  const { deleteUser } = useDelete();

  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [formData, setFormData] = useState({});
  const { updateUser, isLoading } = useUpdate();

  function handleSubmit(e) {
    e.preventDefault();
    updateUser(formData, {
      onSettled: () => {
        setFormData({});
      },
    });
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  useEffect(() => {
    const handleFileUpload = (file) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      toast.promise(
        new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            () => {},
            () => {
              reject('Image size should be less than 2 MB');
            },
            () => {
              getDownloadURL(uploadTask.snapshot.ref)
                .then((downloadURL) => {
                  setFormData((prevFormData) => ({
                    ...prevFormData,
                    avatar: downloadURL,
                  }));
                  resolve('Photo uploaded successfully');
                })
                .catch((error) => {
                  reject(error.message);
                });
            }
          );
        }),
        {
          loading: 'Uploading photo',
          success: 'Uploaded photo successfully',
          error: 'Select an image with size < 2MB',
        }
      );
    };
    if (file) handleFileUpload(file);
  }, [file]);

  return (
    <div className="flex flex-col sm:w-full max-w-[600px] mt-5 mx-5 sm:mx-auto items-center bg-primary-50 p-4 sm:p-8 rounded-lg shadow-md">
      <div className="w-full px-4 sm:px-8">
        <h1 className="mt-4 font-semibold text-2xl text-primary-900 text-center">Profile</h1>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 w-full">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            ref={fileRef}
            className="hidden"
            accept="image/*"
          />
          <img
            onClick={() => fileRef.current.click()}
            src={formData.avatar || user.avatar}
            alt="Profile"
            className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
          />
          <input
            type="text"
            placeholder="Name"
            id="name"
            className="border p-3 rounded-lg placeholder-primary-900 w-full text-primary-900"
            onChange={handleChange}
            defaultValue={user.name}
          />
          <input
            type="email"
            placeholder="Email"
            id="email"
            className="border p-3 rounded-lg placeholder-primary-900 w-full text-primary-900"
            onChange={handleChange}
            defaultValue={user.email}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary-600 font-bold text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
          >
            Update
          </button>
        </form>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mt-5 justify-between text-sm w-full">
          <button
            type="button"
            className="text-red-700 bg-red-100 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors duration-300 w-full sm:w-auto"
            onClick={logout}
          >
            Logout
          </button>
          <button
            type="button"
            className="text-red-700 bg-red-100 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors duration-300 w-full sm:w-auto"
            onClick={deleteUser}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}