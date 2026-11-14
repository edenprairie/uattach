import Image from 'next/image';
import Link from 'next/link';
import { SAMPLE_CATALOG_PREVIEW_URL, SAMPLE_PRODUCTS } from '@/lib/catalog';

export default function Home() {
    return (
        <div className="home-page">
            <section className="home-hero">
                <div className="hero-grid" aria-hidden="true" />
                <div className="home-hero-inner">
                    <div className="hero-copy">
                        <p className="eyebrow hero-eyebrow"><span /> Wholesale equipment partner</p>
                        <h1>Work-ready attachments.<br /><em>Built for the long haul.</em></h1>
                        <p className="hero-intro">
                            Uattach connects American equipment dealers with dependable attachments sourced from China.
                            Browse the sample catalog, build a quantity request, and let us plan the load with you.
                        </p>
                        <div className="hero-actions">
                            <Link href="/login" className="button button-red">Member sign in <span>↗</span></Link>
                            <a href="#equipment" className="button button-outline">View sample product <span>↓</span></a>
                        </div>
                        <div className="hero-note"><span className="note-rule" />Trade access for approved partners</div>
                    </div>
                    <div className="hero-art-wrap">
                        <div className="hero-art-shadow" />
                        <div className="hero-art-frame">
                            <div className="hero-art-media">
                                <Image
                                    src={SAMPLE_CATALOG_PREVIEW_URL}
                                    alt="Standard Low Pro Bucket sample product catalog page"
                                    fill
                                    priority
                                    sizes="(max-width: 800px) 85vw, 44vw"
                                    className="hero-art-image"
                                    unoptimized
                                />
                            </div>
                            <div className="hero-art-label"><span>PRODUCT FILE 001</span><span>SKID STEER / BUCKETS</span></div>
                        </div>
                        <div className="hero-sticker"><span>U</span><small>UATTACH<br />WHOLESALE</small></div>
                        <div className="hero-art-index">01 <i /> 05</div>
                    </div>
                </div>
                <div className="hero-bottomline"><span>Attachments for the people who put them to work</span><span>United States · Direct supply</span></div>
            </section>

            <section className="intro-strip" id="about">
                <div className="intro-label"><span>01 / WHO WE ARE</span><i /></div>
                <div className="intro-copy">
                    <h2>A clearer path from factory floor to jobsite.</h2>
                    <p>We support equipment businesses with practical product information, consolidated ordering, and freight planning from the first quantity list through shipment coordination.</p>
                </div>
                <div className="intro-stat"><strong>One</strong><span>partner portal<br />for catalog + orders</span></div>
            </section>

            <section className="catalog-feature" id="equipment">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow"><span /> THE SAMPLE CATALOG</p>
                        <h2>Product details,<br /><em>in full view.</em></h2>
                    </div>
                    <p className="section-side-note">Preview the product sheet, then sign in to browse the catalog page by page, choose quantities, and plan your load.</p>
                </div>
                <div className="sample-product-card">
                    <div className="sample-cover">
                        <div className="sample-cover-heading"><span>PRODUCT SHEET / 01</span><span>SKID STEER ATTACHMENTS</span></div>
                        <Image src={SAMPLE_CATALOG_PREVIEW_URL} alt="Sample specification sheet for a Standard Low Pro Bucket" fill sizes="(max-width: 800px) 90vw, 50vw" unoptimized />
                        <span className="cover-tag">SAMPLE CATALOG <i /> PAGE 01</span>
                    </div>
                    <div className="sample-details">
                        <div className="sample-title-row"><span className="product-number">01</span><div><p className="eyebrow">SKID STEER ATTACHMENT</p><h3>Standard Low Pro Bucket</h3></div></div>
                        <p className="sample-description">The sample sheet brings the key specifications and available widths together, so your team can review the product before building a quantity request.</p>
                        <div className="sample-specs">
                            <div><span>Bucket depth</span><strong>30.7 in</strong></div>
                            <div><span>Bucket height</span><strong>21.5 in</strong></div>
                            <div><span>Capacity</span><strong>15.5–21.7 cu ft</strong></div>
                        </div>
                        <div className="size-row"><span>AVAILABLE WIDTHS</span><div>{SAMPLE_PRODUCTS.map((product) => <b key={product.id}>{product.name.split(' - ')[1]?.replace(' STD', '')}</b>)}</div></div>
                        <div className="sample-card-actions"><Link href="/login" className="button button-red">Browse the member catalog <span>↗</span></Link><p className="catalog-disclaimer">Sample catalog · 1 page</p></div>
                    </div>
                </div>
            </section>

            <section className="workflow-section">
                <div className="workflow-heading"><p className="eyebrow"><span /> SIMPLE ORDERING</p><h2>From catalog page<br /><em>to load plan.</em></h2></div>
                <div className="workflow-steps">
                    <article><span>01</span><h3>Browse</h3><p>Turn through product pages and check the details that matter to your business.</p></article>
                    <article><span>02</span><h3>Build your list</h3><p>Select the size and quantity you need. Your order stays price-free.</p></article>
                    <article><span>03</span><h3>Review the load</h3><p>See estimated product weight and the suggested container split before sending your request.</p></article>
                </div>
            </section>

            <section className="portal-banner">
                <div><p className="eyebrow"><span /> PARTNER ACCESS</p><h2>Your catalog,<br /><em>one sign-in away.</em></h2></div>
                <p>Member accounts are for Uattach’s business partners. A separate customer area is reserved for partner businesses and will be shaped around their workflow.</p>
                <Link href="/login" className="button button-light">Enter the member portal <span>↗</span></Link>
            </section>

            <section className="contact-row" id="contact"><span>QUESTIONS ABOUT WHOLESALE ACCESS?</span><p>Talk with your Uattach business contact about an account.</p><Link href="/login">Member sign in <span>→</span></Link></section>
        </div>
    );
}
