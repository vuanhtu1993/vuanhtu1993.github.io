import React, { useRef, useEffect } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styled from 'styled-components'
// import Typed from 'react-typed';
import Typed from "typed.js";

export default function Home() {
  const { siteConfig } = useDocusaurusContext();

  const el = useRef(null);

  useEffect(() => {
    const typed = new Typed(el.current, {
      strings: ["Tôi là fullstack developer",
        "Tôi yêu công nghệ, đặc biệt là AI và Blockchain"
      ], // Strings to display
      // Speed settings, try diffrent values untill you get good results
      startDelay: 300,
      typeSpeed: 100,
      backSpeed: 100,
      backDelay: 100,
      loop: true
    });

    // Destropying
    return () => {
      typed.destroy();
    };
  }, []);

  return (
    <Layout
      title={`Anhhtus stories`}
      description="Description will go into a meta tag in <head />">
      <Container width="1200px" className=''>
        <div className='w-full'>
          <Hero>Chào mừng đến với câu chuyện của</Hero>
          <SuperHero>Vũ Anh Tú</SuperHero>
          <span style={{ fontFamily: "Ysabeau", fontSize: 20, fontWeight: 'bold', color: "#616d81" }} ref={el}></span>
          <div className='mt-2' />
          <SubHero>Tôi có sự tò mò vô hạn về AI, hơn hết là Deep Learning. Tôi đam mê tạo ra các ứng dụng thông minh
            để phục vụ con người trong nhiều lĩnh vực
          </SubHero>
          <SubHero>
            Tôi thành thạo lập trình web bằng Javascript, Python. Tôi có nhiều kinh nghiệm với OOP và design pattern. Kiến thức về cấu
            trúc dữ liệu và giải thuật, phân tích thiết kế dự án
          </SubHero>
          <SubHero>
            Tôi có kỹ năng giải quyết vấn đề, khả năng tự học, tự nghiên cứu rất cao. Nhờ đam mê công nghệ và thành thạo đọc hiểu tài liệu tiếng anh tôi thường xuyên tiếp
            cận kiến thức mới về lập trình ứng dụng và AI
          </SubHero>
        </div>
        <Profile src="img/anhhtus.svg" />
      </Container>
    </Layout>
  );
}

const Container = styled.div`
  width: 100%;
  display: block;
  margin: 0 auto;
  padding: 16px;
  @media (min-width: 1024px) {
    width: ${props => props.width || '1400px'};
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 16px;
    margin-top: 48px;
  }
`

const Profile = styled.img`
  width: 250px;
  height: auto;
  display: block;
  margin: 0 auto;
  @media (min-width: 1024px) {
    
  }
`

const SuperHero = styled.h1`
  font-family: Ysabeau;
  font-size: 60px;
  font-weight: bolder;
  color: #388967
`

const Hero = styled.h2`
font-size: 20px;
  font-family: Ysabeau;
  font-weight: normal;
`

const SubHero = styled.p`
font-family: Ysabeau;
font-size: 20px;
`

const AutoTyped = styled(Typed)`
  font-family: Ysabeau !important;
  font-size: 20px;
  font-weight: bold;
`

const Banner = styled.img`
  width: 100%;
  height: 500px;
  object-fit: cover;
`