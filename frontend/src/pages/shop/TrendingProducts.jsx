import React, { useState } from 'react'
import ProductCards from './ProductCards'

import { useFetchAllProductsQuery } from "../../redux/features/products/productsApi";


const TrendingProducts = () => {
  
  const [visibleProducts, setVisibleProducts] = useState(8);
  const loadMoreProducts = () => {
    setVisibleProducts(prevCount => prevCount +  4)
  }

  const { data: { products = [], totalProducts = 0  } = {}, isLoading } =
   useFetchAllProductsQuery({
    page: 1,
    limit: visibleProducts
  });

  if (isLoading) return <p>Loading...</p>;
  
  return (
    <section className='section__container product_container'>
       <h2 className='section__header'>Trending Products</h2>
       <p className='section__subheader'>Discover the Hottest picks: Elevate your
                Style with Our Curated Collection of Trending Women's Fashion Products</p>
        
        {/* products card */}
       <div className='mt-12'>
            <ProductCards products ={products.slice(0, visibleProducts)}/>
       </div>
       {/* load more product btn */}
       <div className='product__btn'>
           {/* {
            visibleProducts < products.length && (
              <button className='btn' onClick={loadMoreProducts}>Load More</button>
            )
           } */}

            {visibleProducts < totalProducts && (
               <button className='btn' onClick={loadMoreProducts}>
                 Load More
               </button>
            )}
       </div>
    </section>
  )
}

export default TrendingProducts