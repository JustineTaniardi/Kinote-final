import Header from "./components/Header";
import Content from "./components/Content";
import Footer from "./components/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <Content />
        <Footer />
      </main>
    </>
  );
}
