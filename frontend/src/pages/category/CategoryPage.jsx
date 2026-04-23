



import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFetchAllProductsQuery } from '../../redux/features/products/productsApi'
import ProductCards from '../shop/ProductCards';

const CategoryPage = () => {

    // to get the categoryName from url
    const { categoryName } = useParams();
    
    // la reponse de l'Api qui nous retourne un objet
    const { data: { products = [] } = {}, isLoading } =
    useFetchAllProductsQuery({
      category: categoryName,
      page: 1,
      limit: 20
    })

     if (isLoading) return <p>Loading...</p>
    
   


    return (
        <>
            <section className='section__container bg-primary-light'>
                <h2 className='section__header capitalize'>{categoryName}</h2>
                <p className='section__subheader'>
                    Browse a diverse range of categories, from chic
                    dresses to versatile accessories. Elevate your style today!
                </p>
            </section>
            {/* products card */}
            <div className='section__container'>
                <ProductCards products={products}/>
            </div>
        </>
    )
}

export default CategoryPage