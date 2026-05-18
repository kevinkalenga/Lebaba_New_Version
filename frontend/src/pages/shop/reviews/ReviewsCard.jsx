
import commentorIcon from "../../../assets/avatar.png"
import { formateDate } from "../../../utils/formateDate"
import RatingStars from '../../../components/RatingStars'
import { useState } from "react";
import PostAReview from "./PostAReview"
import { useSelector } from "react-redux";
import { useCanUserReviewQuery } from '../../../redux/features/products/productsApi';
import { useGetReviewsByProductIdQuery } from '../../../redux/features/reviews/reviewsApi';



const ReviewsCard = ({ productReviews, productId }) => {

    const [isModalOpen, setIsModalOpen] = useState(false)
    // const reviews = productReviews || []
    const { data: reviews = [] } = useGetReviewsByProductIdQuery(productId);
    console.log("REVIEWS API:", reviews);

    const { user } = useSelector(state => state.auth);
    
     const { data, isLoading } = useCanUserReviewQuery(productId, {
           skip: !productId || !user
        });

         console.log(data)
         console.log("PRODUCT ID PROP:", productId);
    
        const canReview = data?.canReview ;

    const handleOpenReviewModal = () => {
        setIsModalOpen(true)
    }

    const handleCloseReviewModal = () => {
        setIsModalOpen(false)
    }

    return (
        <div className='my-6  bg-white p-8'>
            <div>
                {
                    reviews.length > 0 ? (<div>
                        <h3 className='text-lg font-medium'>All comments...</h3>
                        <div>
                            {
                                reviews.map((review, index) => (
                                    
                                    <div key={index} className='mt-4'>
                                        <div className='flex gap-4  items-center'>
                                            <img
                                                src={review?.userId?.profileImage || commentorIcon}
                                                alt={review?.userId?.username}
                                                className='size-14 object-cover rounded-full'
                                            />
                                            {/* <img src={user?.userId?.profileImage?.secure_url || commentorIcon} alt={review?.userId?.username} className='size-14 object-cover rounded-full' /> */}
                                            <div className='space-y-1'>
                                                <p className='text-lg font-medium underline capitalize underline-offset-4 text-blue-400'>{review?.userId?.username}</p>
                                                <p className='text-[12px] italic'>{formateDate(review?.updatedAt)}</p>
                                                <RatingStars rating={review?.rating} />
                                            </div>
                                        </div>
                                        <div className='text-gray-600 mt-5  border p-8'>
                                            <p className='md:w-4/5'>{review?.comment}</p>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>) : <p>No reviews yet!</p>
                }
            </div>

            {/* add review button */}
            <div className="mt-12">
               {
                 canReview && (
                    <button
                        onClick={handleOpenReviewModal}
                        className="px-6 py-3 bg-primary text-white rounded-md">
                        Add A Review
                    </button>
                 )
               }
            </div>
            {/* review modal */}
           <PostAReview isModalOpen={isModalOpen} handleClose={handleCloseReviewModal}   productId={productId} />
        </div>


    )
}

export default ReviewsCard


