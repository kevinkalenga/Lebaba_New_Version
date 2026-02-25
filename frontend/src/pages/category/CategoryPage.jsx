



import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import products from "../../data/products.json";
import ProductCards from '../shop/ProductCards';

const CategoryPage = () => {

    // to get the categoryName from url
    const { categoryName } = useParams();

    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        const filtered = products.filter((product) => product.category === categoryName.toLowerCase());
        setFilteredProducts(filtered);
    }, [categoryName])
    
    // to load the page from the top
    useEffect(() => {
        window.scroll(0, 0)
    })


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
                <ProductCards products={filteredProducts} />
            </div>
        </>
    )
}

export default CategoryPage