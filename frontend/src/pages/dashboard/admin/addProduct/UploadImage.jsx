import React, { useState } from 'react'
import axios from 'axios'
import { getBaseUrl } from '../../../../utils/baseURL';


const UploadImage = ({ name, setImage }) => {
    const [loading, setLoading] = useState(false);
    const [url, setUrl] = useState("");

       
       const uploadImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const convertBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (err) => reject(err);
        });

        const base64 = await convertBase64(file);

        setLoading(true);

        try {
            const res = await axios.post(
                `${getBaseUrl()}/uploadImage`,
                { image: base64 }
            );

            const imageUrl = res.data.url;

            setImage(imageUrl);
            setUrl(imageUrl);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
       

    return (
        <div>
            <label htmlFor={name}>Upload Image</label>

            <input
                type="file"
                name={name}
                id={name}
                onChange={uploadImage}
                className='add-product-InputCSS'
            />

            {loading && (
                <div className='mt-2 text-sm text-blue-600'>
                    Uploading...
                </div>
            )}

            {url && (
                <div className='mt-2 text-sm text-green-600'>
                    <p>Image uploaded successfully!</p>
                    <img src={url} alt="uploaded" />
                </div>
            )}
        </div>
    );
};




export default UploadImage