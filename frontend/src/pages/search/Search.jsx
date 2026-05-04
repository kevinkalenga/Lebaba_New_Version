


import { useState } from "react";
import { useFetchAllProductsQuery } from "../../redux/features/products/productsApi";
import ProductCards from "../shop/ProductCards";
import { useNavigate } from "react-router-dom";

const Search = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);

    const navigate = useNavigate();

    //  fetch produits depuis la BD
    const { data, isLoading, error } = useFetchAllProductsQuery({});

    const products = data?.products || [];

    const handleSearch = () => {
        const query = searchQuery.toLowerCase();

        const filtered = products.filter((product) =>
            product.name.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query)
        );

        setFilteredProducts(filtered);
    };

    const displayProducts =
        filteredProducts.length > 0 || searchQuery
            ? filteredProducts
            : products;

    if (isLoading) return <div>Loading products...</div>;
    if (error) return <div>Error loading products</div>;

    return (
        <>
            <section className="section__container bg-primary-light">
                <h2 className="section__header">Search Products</h2>
                <p className="section__subheader">
                    Browse products from database
                </p>
            </section>

            <section className="section__container">
                <div className="w-full mb-12 flex flex-col md:flex-row items-center justify-center gap-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-bar w-full max-w-4xl p-2 border rounded"
                        placeholder="Search for products..."
                    />

                    <button
                        onClick={handleSearch}
                        className="search-button w-full md:w-auto py-2 px-8 bg-primary text-white rounded"
                    >
                        Search
                    </button>
                </div>

                {/*  clic produit -> detail */}
                <div
                    onClick={(e) => {
                        const id = e.target.closest("[data-id]")?.dataset.id;
                        if (id) navigate(`/products/${id}`);
                    }}
                >
                    <ProductCards products={displayProducts} />
                </div>
            </section>
        </>
    );
};

export default Search;