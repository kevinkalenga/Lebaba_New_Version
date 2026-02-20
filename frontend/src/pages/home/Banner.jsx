import React from 'react'
import {Link} from 'react-router-dom'
import bannerImg from '../../assets/header.png'

const Banner = () => {
  return (
    <div className='section__container header__container'>
       <div className='header__content z-30'>
          <h4 className='uppercase'>UP TO 20% Discount on</h4>
          <h1>Girl's Fashion</h1>
          <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Illo, alias! Culpa error nesciunt, maiores minima quidem
              non provident laudantium molestiae deleniti fuga possimus!
              Iusto mollitia explicabo deleniti aliquid assumenda
              minima id dicta. Cum quam at commodi minima asperiores
              nostrum, dolore eos rem voluptate, unde sed in aliquam
              aperiam, laboriosam quidem.
          </p>
          <button className='btn'>
             <Link to='/shop'>EXPLORE NOW</Link>
          </button>
       </div>
       <div className='header__image'>
         <img src={bannerImg} alt="banner image" />
       </div>
    </div>
  )
}

export default Banner