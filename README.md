# K Essence Atelier

PROJECT NAME:
K ESSENCE — Luxury Perfume & Attar E-Commerce Platform

PROJECT TYPE:
Premium D2C Perfume + Attar E-Commerce Website
with a powerful Admin Dashboard and Manufacturing/Inventory Management System.

========================================================
1. BRAND IDENTITY
========================================================

Brand Name:
K ESSENCE

Business:
K ESSENCE is a perfume and attar manufacturing brand.

The company manufactures and sells premium perfumes, attars and fragrance products directly to customers.

Brand positioning:
Luxury
Premium
Elegant
Indian + Oriental fragrance heritage
Modern
Sophisticated
Exclusive
Cinematic
High-end

The supplied K ESSENCE logo is the official brand logo.

IMPORTANT:
Use the uploaded K ESSENCE logo as the primary brand identity.

Do NOT redesign the logo.
Do NOT replace the logo.
Do NOT change its typography.
Do NOT change its crown, ornamentation or K/ESSENCE lettering.

The visual identity should be derived from the logo:

- Obsidian black
- Deep black
- Charcoal
- Metallic gold
- Champagne gold
- Warm bronze
- Subtle ivory
- Very subtle dark burgundy/brown accents

The overall website should feel like:
"Luxury perfume boutique + cinematic fragrance experience + modern 3D showroom."

Do NOT make the website look like a generic Shopify store.

Do NOT copy Adil Qadri or BellaVita.

Use them only as UX/business references.

The K ESSENCE website must have its own identity.

========================================================
2. DESIGN DIRECTION
========================================================

Create a DARK LUXURY CINEMATIC DESIGN.

The website should immediately communicate:

Luxury
Perfume
Craftsmanship
Premium quality
Mystery
Elegance
Exclusivity

Primary background:
Near-black / obsidian.

Use:
- black glass panels
- subtle gradients
- metallic gold borders
- soft gold glow
- subtle grain
- atmospheric shadows
- glassmorphism where appropriate
- elegant typography
- cinematic lighting

Do NOT overuse gold.

Gold should be used as a premium accent.

Avoid:
- bright colorful gradients
- childish UI
- excessive rounded cards
- generic SaaS dashboard appearance
- flat white e-commerce design
- cheap-looking gold effects
- excessive animations
- visual clutter

========================================================
3. CORE VISUAL CONCEPT
========================================================

The website should feel like the user has entered a luxury fragrance showroom.

Imagine:

A dark room.

A premium perfume bottle illuminated by a narrow golden spotlight.

Very subtle floating particles.

Soft fragrance smoke.

Reflections on a black reflective surface.

The perfume bottle slowly rotates.

When the user moves the mouse:
the bottle reacts to the cursor.

When the user hovers:
the product should have a 3D interaction.

When the user scrolls:
sections should reveal themselves through cinematic transitions.

The experience should feel premium and smooth rather than flashy.

========================================================
4. 3D REQUIREMENT — VERY IMPORTANT
========================================================

Do NOT build the product catalog using only static images.

The website must be designed around interactive 3D product presentation.

Use:

Three.js
React Three Fiber
@react-three/drei
GSAP and/or Framer Motion

where appropriate.

The architecture must support:

GLB / GLTF 3D perfume bottle models.

Each product should optionally support:

- 3D model
- product images
- 360-degree rotation
- product video
- transparent PNG
- hover animation

========================================================
5. PRODUCT CARD 3D INTERACTION
========================================================

Product cards must NOT feel static.

On desktop:

When the user moves the cursor over a product:

1. Product slightly lifts from the surface.
2. Product rotates subtly toward the cursor.
3. Product performs a smooth 3D tilt.
4. Lighting/reflection changes.
5. A soft shadow appears underneath.
6. Gold highlight appears around the product.
7. Product image/model slightly zooms.
8. Add-to-cart button smoothly appears.
9. Product information transitions upward.

For products that have actual 3D GLB/GLTF models:

Use a small 3D canvas and allow the bottle to rotate.

For products that do not yet have a 3D model:

Create a premium animated fallback using:
- perspective transform
- mouse-follow tilt
- depth/shadow
- parallax
- subtle reflection
- layered image effect

But architect the system so a real 3D model can be uploaded later from Admin.

IMPORTANT:
Do NOT pretend a flat image is a real 3D model.

The CMS should support uploading a real 3D model for products.

========================================================
6. HERO SECTION
========================================================

Create a FULL-SCREEN cinematic hero.

Desktop:
minimum height approximately 90–100vh.

Mobile:
approximately 80–90vh.

Background:
deep black cinematic environment.

Center/right:
large premium 3D perfume bottle.

The bottle should:

- slowly rotate
- have realistic lighting
- cast a soft shadow
- have subtle reflections
- react to mouse movement
- have a premium spotlight
- have very subtle floating particles around it

Add atmospheric fragrance smoke.

Do NOT make the smoke excessive.

Hero text:

K ESSENCE

THE ART OF FRAGRANCE

"Crafted for those who leave a trace."

Primary CTA:
EXPLORE COLLECTION

Secondary CTA:
DISCOVER ATTARS

Add subtle scroll indicator:

"SCROLL TO DISCOVER"

Hero animation:
- fade-in
- slow camera movement
- bottle entrance
- text reveal
- light sweep

Do not make the hero animation too fast.

========================================================
7. TOP ANNOUNCEMENT BAR
========================================================

Add a thin premium announcement bar.

Example:

"CRAFTED IN INDIA • PREMIUM FRAGRANCES • SIGNATURE ATTARS"

Make the text configurable from Admin.

Admin should be able to change:
- text
- enable/disable
- link
- background
- scheduling

========================================================
8. HEADER
========================================================

Desktop header:

LEFT:
Search

CENTER:
K ESSENCE logo

RIGHT:
Account
Wishlist
Cart

Below or integrated:

HOME
SHOP
PERFUMES
ATTARS
COLLECTIONS
GIFTING
ABOUT
CONTACT

Use elegant typography.

Header should be transparent over the hero and become a dark glass header after scrolling.

Sticky header.

On scroll:
- subtle backdrop blur
- black translucent background
- gold accent
- smooth transition

========================================================
9. MEGA MENU
========================================================

Create premium mega menus.

SHOP

Categories:

Perfumes
Attars
Premium Attars
Oud Collection
Non-Alcoholic Fragrances
Perfume Oils
Gift Sets
Combo Sets
Discovery Sets
New Arrivals
Best Sellers

PERFUMES:

Men
Women
Unisex
Premium
Everyday
Luxury
Long Lasting

ATTARS:

Traditional Attars
Luxury Attars
Oud Attars
Musk Attars
Floral Attars
Woody Attars
Sandalwood
Saffron

COLLECTIONS:

Royal Collection
Signature Collection
Oud Collection
Arabic Collection
Luxury Collection
Daily Wear
Wedding Collection
Limited Edition
Best Sellers

GIFTING:

Gift Sets
Couples Sets
Men's Gifts
Women's Gifts
Corporate Gifting
Festival Gifts

Mega menu should contain small visual category previews.

========================================================
10. HOMEPAGE STRUCTURE
========================================================

Homepage sections:

1. Cinematic Hero
2. Featured Collections
3. Best Sellers
4. Signature Perfumes
5. Premium Attars
6. 3D Fragrance Experience
7. Fragrance Finder
8. Manufacturing Story
9. New Arrivals
10. Gift Sets
11. Why K ESSENCE
12. Customer Reviews
13. Instagram / Social Gallery
14. Newsletter
15. Premium Footer

Each section should have subtle scroll-based animation.

========================================================
11. FEATURED COLLECTIONS
========================================================

Create large cinematic cards.

Example:

ROYAL COLLECTION

SIGNATURE ATTARS

THE OUD COLLECTION

LUXURY PERFUMES

Each card should support:

- background image/video
- optional 3D object
- hover animation
- gold lighting
- CTA
- Admin-controlled content

On hover:

- card expands slightly
- image zooms
- light sweep
- title moves upward
- CTA appears

========================================================
12. BEST SELLERS
========================================================

Create a premium product carousel.

Each card must show:

Badge:
BEST SELLER

Product name

Category

Rating

Review count

MRP

Selling price

Discount

Size selector

Add to Cart

Buy Now

Wishlist

3D interaction

Example:

ROYAL OUD
Luxury Attar

★★★★★ 4.8
(124 reviews)

₹1,299
₹1,699

SAVE 24%

[ADD TO CART]

========================================================
13. PRODUCT CARD
========================================================

Product cards must support:

- 3D model
- product image
- hover rotation
- mouse tracking
- wishlist
- quick view
- quick add
- size selection
- price
- discount
- rating
- badge
- stock status

Badges:

BEST SELLER
NEW
TRENDING
LIMITED
EXCLUSIVE
SALE

Cards should NOT look like generic e-commerce cards.

Use large product visual area.

========================================================
14. SHOP PAGE
========================================================

Create:

/shop

Left filter sidebar on desktop.

Mobile:
filter opens as bottom sheet/full-screen drawer.

Filters:

Category
Gender
Price
Fragrance Family
Fragrance Notes
Concentration
Size
Rating
Availability
Collection
Occasion
Longevity
Sillage

Fragrance Families:

Woody
Floral
Citrus
Fresh
Oriental
Amber
Musky
Gourmand
Aquatic
Spicy
Earthy

Notes:

Oud
Rose
Musk
Vanilla
Sandalwood
Saffron
Amber
Jasmine
Bergamot
Cedar
Patchouli

Sort:

Recommended
Best Selling
Newest
Price Low to High
Price High to Low
Highest Rated
Discount

Support:

Pagination OR infinite loading.

========================================================
15. FRAGRANCE FINDER
========================================================

Create an interactive fragrance recommendation system.

Page:

/fragrance-finder

Step 1:

Who are you shopping for?

Men
Women
Unisex

Step 2:

What mood do you want?

Fresh
Elegant
Royal
Romantic
Mysterious
Powerful
Warm
Luxury

Step 3:

When will you wear it?

Daily
Office
Date Night
Wedding
Party
Special Occasion

Step 4:

Which fragrance family?

Woody
Floral
Fresh
Oud
Musky
Oriental
Gourmand

Then show:

"YOUR FRAGRANCE MATCH"

Display recommended products.

Add:

MATCH SCORE: 94%

[VIEW PRODUCT]

Make this visually interactive and animated.

========================================================
16. PRODUCT DETAIL PAGE
========================================================

URL:

/product/:slug

This must be a premium immersive product page.

Left:

Large 3D product viewer.

Right:

Product information.

Product:

Name
Category
Rating
Review count
MRP
Selling Price
Discount

Size:

5ml
10ml
20ml
50ml
100ml

depending on product.

Buttons:

ADD TO CART
BUY NOW

Wishlist

Share

========================================================
17. 3D PRODUCT VIEWER
========================================================

On product page:

Large 3D bottle.

User can:

- rotate
- drag
- zoom
- inspect
- reset view

Add controls:

ROTATE
ZOOM
RESET

On mouse movement:
very subtle camera parallax.

Do not make the object rotate uncontrollably.

Provide mobile touch controls.

If no 3D model exists:
show a premium animated image fallback.

========================================================
18. FRAGRANCE PYRAMID
========================================================

Every perfume product should support:

TOP NOTES

HEART NOTES

BASE NOTES

Visualize them as an elegant vertical fragrance pyramid.

Example:

TOP
Bergamot
Saffron

↓

HEART
Rose
Oud

↓

BASE
Musk
Amber
Sandalwood

Admin should be able to configure notes per product.

========================================================
19. FRAGRANCE PERFORMANCE
========================================================

Product page should optionally display:

Longevity
Sillage
Projection

Use elegant visual meters.

Example:

Longevity
█████████░ 9/10

Sillage
████████░░ 8/10

Projection
████████░░ 8/10

These values must be editable from Admin.

========================================================
20. PRODUCT INFORMATION
========================================================

Support:

Description
Fragrance Story
Fragrance Family
Top Notes
Heart Notes
Base Notes
Concentration
Gender
Occasion
Season
Longevity
Sillage
Volume
Ingredients
How to Use
Manufacturing Information
Country of Origin
Shelf Life

Use accordion sections.

========================================================
21. REVIEWS
========================================================

Product review system.

Customer can:

Give rating
Write review
Upload photo
Upload video

Display:

Overall rating

5 star distribution

Verified Purchase badge

Review sorting:

Newest
Highest Rated
Lowest Rated
With Photos
With Videos

Admin must approve/reject reviews.

========================================================
22. RELATED PRODUCTS
========================================================

At bottom of product page:

YOU MAY ALSO LIKE

Based on:

Category
Fragrance family
Notes
Price
Customer behavior

Display animated 3D product cards.

========================================================
23. CART
========================================================

Create premium cart drawer + cart page.

Cart drawer should open smoothly.

Show:

Product
3D/image thumbnail
Size
Quantity
Price
Remove
Wishlist

Show:

Subtotal
Discount
Shipping
Tax
Total

Show progress:

"Add ₹300 more to unlock FREE SHIPPING"

Also show:

YOU MAY ALSO LIKE

Add coupon field.

========================================================
24. CHECKOUT
========================================================

Create clean distraction-free checkout.

Steps:

1. Contact
2. Address
3. Delivery
4. Payment
5. Confirmation

Support:

UPI
Credit Card
Debit Card
Net Banking
Wallets
COD

Architecture should be ready for Razorpay integration.

IMPORTANT:
Never expose secret API keys in frontend.

Payment order creation and payment verification must happen server-side.

Use webhooks for payment status synchronization.

========================================================
25. USER AUTHENTICATION
========================================================

Customer authentication:

Email
Mobile
Password
OTP where supported

Pages:

/login
/register
/forgot-password

Optional social login architecture.

========================================================
26. USER ACCOUNT
========================================================

Create:

/account

Dashboard

Profile
Orders
Order Details
Wishlist
Saved Addresses
Payment History
Reviews
Coupons
Rewards
Notifications
Support
Logout

========================================================
27. ORDER TRACKING
========================================================

Create visual timeline:

ORDER PLACED
↓
PAYMENT CONFIRMED
↓
PROCESSING
↓
PACKED
↓
SHIPPED
↓
OUT FOR DELIVERY
↓
DELIVERED

Show:

Order ID
Tracking Number
Courier
Expected Delivery
Invoice
Shipping Address

========================================================
28. WISHLIST
========================================================

Customer can add/remove products.

Wishlist products should support:

3D hover
Price
Discount
Stock
Add to Cart

========================================================
29. GIFTING
========================================================

Create dedicated:

/gifting

Sections:

Luxury Gift Sets
Attar Gift Sets
Perfume Sets
Wedding Gifts
Corporate Gifts
Festival Gifts
Couples Sets

Allow:

Gift packaging
Gift message

if supported by backend.

========================================================
30. MANUFACTURING STORY
========================================================

Create:

/manufacturing

This page should explain that K ESSENCE is a manufacturer.

Use cinematic visuals.

Sections:

Our Craft
Raw Materials
Fragrance Development
Blending
Maturation
Quality Control
Filling
Packaging
Final Inspection

Do not invent certifications or claims.

Only display real certifications and manufacturing claims when provided by the business/admin.

========================================================
31. ABOUT PAGE
========================================================

Create:

/about

Brand story
Founder/company story
Manufacturing capability
Vision
Mission
Craftsmanship
Quality philosophy

Use cinematic storytelling.

========================================================
32. WHOLESALE / B2B
========================================================

Create:

/wholesale

Because K ESSENCE is a manufacturer.

Include:

Wholesale
Bulk Orders
Corporate Gifting
Private Label
Distributor Inquiry

Inquiry form:

Name
Company
Phone
Email
GSTIN
City
Product Interest
Required Quantity
Message

Submit Inquiry.

Store inquiry in Admin.

========================================================
33. CONTACT
========================================================

/contact

Show:

Phone
Email
Business Address
Business Hours
Google Maps integration placeholder
WhatsApp CTA
Instagram CTA

Use actual business information only when provided.

Do not invent phone numbers or addresses.

========================================================
34. INSTAGRAM / SOCIAL
========================================================

Create Instagram-inspired gallery section.

Use the official K ESSENCE Instagram as the social reference:

https://www.instagram.com/kumar_essence/

Display:

Latest posts
Product visuals
Behind-the-scenes manufacturing
Bottle photography
Brand content

Do not scrape Instagram without proper API/permissions.

Create an Admin-managed social gallery fallback.

Admin should be able to manually add:

Image
Video
Instagram URL
Caption

========================================================
35. ADMIN PANEL
========================================================

Create a completely separate Admin application.

Route:

/admin

Do NOT use the customer navigation.

Admin design:

Dark enterprise dashboard.

Sidebar:

Dashboard

Catalog
Products
Categories
Collections
Variants
Fragrance Notes
Product Media

Inventory
Inventory Overview
Stock Movements
Warehouses
Low Stock
Out of Stock
Stock Transfer

Manufacturing
Raw Materials
Formulas
BOM
Production Orders
Production Batches
Quality Control
Finished Goods

Orders
All Orders
New Orders
Processing
Packed
Shipped
Delivered
Cancelled
Returns

Payments
Transactions
Refunds
COD
Payment Reconciliation

Billing
Invoices
GST
Credit Notes
Debit Notes

Customers
All Customers
Customer Groups
VIP Customers

Marketing
Coupons
Promotions
Campaigns
Abandoned Cart

Shipping
Shipments
Tracking
RTO
Returns

Reviews
All Reviews
Pending Reviews

Support
Tickets
Customer Messages

CMS
Homepage
Hero
Banners
Collections
Blog
FAQs
About
Pages

Analytics
Sales
Orders
Products
Customers
Inventory
Profit

Users & Roles

Audit Logs

Settings

========================================================
36. ADMIN DASHBOARD
========================================================

Dashboard should show:

Today's Revenue
Today's Orders
New Customers
Average Order Value
Pending Orders
Low Stock Products
Returns
Refunds

Charts:

Revenue
Orders
Customers
Top Products
Top Categories

Order Funnel:

Placed
Paid
Processing
Packed
Shipped
Delivered

Show real database values.

Use dummy seed data during development.

========================================================
37. CATALOG MANAGEMENT
========================================================

Admin can:

Create product
Edit product
Delete product
Publish/unpublish
Create variants
Set price
Set MRP
Set discount
Set inventory
Upload images
Upload video
Upload 3D GLB/GLTF
Set fragrance notes
Set performance
Set categories
Set collections
Set SEO metadata

Product form:

Basic Information
Pricing
Variants
Inventory
Fragrance
Media
3D Model
SEO
Shipping
Tax

========================================================
38. INVENTORY MANAGEMENT
========================================================

Inventory system must support:

SKU
Product
Variant
Warehouse
Stock
Reserved Stock
Available Stock
Low Stock Threshold
Damaged Stock

Stock movements:

Purchase
Production
Order
Return
Damage
Adjustment
Transfer

Every stock change must create an inventory movement record.

Never silently change stock.

========================================================
39. MANUFACTURING MANAGEMENT
========================================================

Create manufacturer-focused ERP-like module.

Raw Materials:

Fragrance oils
Essential oils
Oud
Musk
Sandalwood
Alcohol
Carrier oils
Bottles
Caps
Sprayers
Labels
Boxes
Packaging materials

Do not assume these are actual K ESSENCE materials.

Admin must be able to configure raw materials.

========================================================
40. FORMULA / BOM SYSTEM
========================================================

Create formula/BOM.

Example:

Product:
Royal Oud 100ml

Formula:

Fragrance Concentrate
Alcohol
Fixative
Other approved ingredients

Packaging:

Bottle
Cap
Sprayer
Box
Label

Admin can define exact quantities.

Do not hardcode sample ingredients as actual business information.

========================================================
41. PRODUCTION BATCHES
========================================================

Create:

Production Batch

Batch Number
Product
Variant
Target Quantity
Produced Quantity
Manufacturing Date
Expiry/Best Before
Raw Material Lots
Production Status
QC Status

Statuses:

Planned
Material Check
In Production
Maturation
QC
Approved
Packaging
Completed
Rejected

When production is completed:

Finished inventory should increase automatically.

========================================================
42. QUALITY CONTROL
========================================================

Create QC module.

Batch:

Batch ID
Product
Production quantity
Test results
QC status
Notes
Approved by
Date

Statuses:

Pending
Passed
Failed
Rework

Do not invent quality claims.

========================================================
43. ORDERS ADMIN
========================================================

Admin order page:

Order ID
Customer
Amount
Payment Status
Fulfillment Status
Date

Order detail:

Customer
Products
Variants
Price
Discount
Tax
Shipping
Payment
Invoice
Shipment
Timeline

Actions:

Confirm
Process
Pack
Generate Invoice
Generate Shipping Label
Ship
Cancel
Refund

========================================================
44. BILLING
========================================================

Create invoice system.

Invoice:

Brand name
Business information
GSTIN if provided
Invoice number
Customer
Address
Items
Quantity
Price
Discount
Tax
Shipping
Total

Actions:

Generate PDF
Download
Print
Email

Create credit notes and refund documentation.

========================================================
45. CUSTOMER MANAGEMENT
========================================================

Admin customer profile:

Name
Phone
Email
Orders
Total Spent
Average Order Value
Last Order
Wishlist
Reviews
Returns
Support Tickets

Customer segmentation:

New
Returning
VIP
Inactive

========================================================
46. MARKETING
========================================================

Admin can create:

Coupons
Discounts
Flash Sales
Combo Offers
Buy X Get Y
Free Shipping
First Order Offers
Festival Offers
Gift Offers

Coupon settings:

Code
Discount Type
Amount
Minimum Order
Maximum Discount
Start Date
End Date
Usage Limit
Per Customer Limit
Applicable Products
Applicable Categories

========================================================
47. ABANDONED CART
========================================================

Track abandoned carts.

Admin can see:

Customer
Products
Cart Value
Time Abandoned

Future-ready for:

Email
SMS
WhatsApp

Do not automatically send messages without configured provider and customer consent.

========================================================
48. SHIPPING
========================================================

Create shipping management.

Statuses:

Ready to Ship
Packed
Shipped
In Transit
Out for Delivery
Delivered
RTO
Returned

Support:

Tracking number
Courier
AWB
Shipping label
Delivery estimate

Keep shipping provider integration modular.

========================================================
49. ANALYTICS
========================================================

Admin analytics:

Revenue
Net Revenue
Orders
Units Sold
Average Order Value
Conversion
Refunds
Discounts
Shipping Cost
Payment Fees

Product analytics:

Best Sellers
Worst Sellers
Low Stock
High Return Rate

Customer analytics:

New Customers
Repeat Customers
Customer Lifetime Value
Repeat Purchase Rate

========================================================
50. PROFIT ANALYTICS
========================================================

Because K ESSENCE is a manufacturer, include estimated profitability.

Show:

Revenue
COGS
Manufacturing Cost
Packaging Cost
Shipping Cost
Payment Fees
Discounts
Refunds
Estimated Gross Profit

Make cost values configurable.

Do NOT claim exact profit unless actual accounting data is available.

========================================================
51. CMS
========================================================

Website must NOT require developer changes for normal content.

Admin can edit:

Hero
Homepage sections
Banners
Collections
Products
Offers
Testimonials
FAQs
Blog
About
Manufacturing story
Footer
Announcement bar

Support:

Publish/unpublish
Scheduling
Ordering
Preview

========================================================
52. SEO
========================================================

Every product/category/collection/page should support:

SEO title
Meta description
Slug
OG image
Canonical URL

Generate:

sitemap.xml
robots.txt

Use semantic HTML.

Product structured data where appropriate.

========================================================
53. ADMIN ROLES
========================================================

Implement RBAC.

Roles:

Super Admin
Operations Manager
Catalog Manager
Warehouse Manager
Production Manager
Accountant
Marketing Manager
Support Agent

Each role must have configurable permissions.

Do not give every employee full access.

========================================================
54. SECURITY
========================================================

Implement:

Authentication
Authorization
RBAC
Protected Admin Routes
Server-side permission checks
Secure API access
Rate limiting where appropriate
Audit logs
Session management
Password reset
Admin activity tracking

Create:

Audit Logs

Example:

Admin changed product price.

Record:

User
Action
Entity
Old Value
New Value
Timestamp

Never expose secrets in frontend.

========================================================
55. DATABASE
========================================================

Use PostgreSQL/Supabase architecture.

Suggested tables:

users
profiles
roles
permissions
role_permissions

products
product_variants
categories
collections
product_categories
product_collections
product_images
product_videos
product_3d_models
fragrance_notes
product_notes

inventory
inventory_movements
warehouses
warehouse_stock

raw_materials
material_inventory
formulas
formula_items
production_orders
production_batches
quality_checks

carts
cart_items
wishlists
wishlist_items

orders
order_items
order_status_history

payments
payment_transactions
refunds

shipments
shipment_tracking

addresses

coupons
promotions
campaigns

reviews
review_media

invoices
invoice_items

customers
customer_segments

support_tickets

blog_posts
pages
banners
homepage_sections
faqs

notifications

audit_logs

settings

========================================================
56. DATABASE RELATIONSHIP
========================================================

Core commerce flow:

CUSTOMER
↓
CART
↓
CHECKOUT
↓
ORDER
↓
PAYMENT
↓
INVOICE
↓
INVENTORY
↓
SHIPMENT
↓
DELIVERY

Manufacturing flow:

RAW MATERIAL
↓
FORMULA / BOM
↓
PRODUCTION ORDER
↓
BATCH
↓
QUALITY CONTROL
↓
FINISHED GOODS
↓
WAREHOUSE
↓
ONLINE INVENTORY

========================================================
57. RESPONSIVE DESIGN
========================================================

The website must be fully responsive.

Desktop
Tablet
Mobile

Do not simply shrink desktop.

Design mobile-specific layouts.

Mobile header:

Menu
Logo
Cart

Mobile bottom navigation:

Home
Shop
Search
Wishlist
Account

Product page should have sticky mobile:

PRICE
ADD TO CART

========================================================
58. PERFORMANCE
========================================================

3D must NOT destroy performance.

Use:

Lazy loading
Code splitting
Compressed assets
WebP/AVIF
Lazy-loaded 3D models
LOD where appropriate
Reduced animation on low-power devices
Intersection Observer
GPU-friendly animations

Do not load every 3D model on initial page load.

Only load 3D models when visible/needed.

========================================================
59. ACCESSIBILITY
========================================================

Support:

Keyboard navigation
ARIA labels
Accessible buttons
Readable contrast
Alt text
Reduced motion preference

If user prefers reduced motion:
disable heavy 3D/scroll animations.

========================================================
60. ANIMATION SYSTEM
========================================================

Animations should be elegant.

Use:

Fade
Slide
Scale
Parallax
3D tilt
Light sweep
Blur transition
Scroll reveal
Morphing where appropriate

Do NOT use:

bouncing buttons
excessive spinning
random animations
fast transitions
annoying particle effects

Animation duration generally:

200ms–800ms for UI.

Hero cinematic animation can be longer.

========================================================
61. DARK GLASS UI
========================================================

Use subtle:

Glass panels
Backdrop blur
Thin borders
Gold highlights
Soft shadows

Example visual hierarchy:

Background:
Obsidian

Panel:
Black translucent

Border:
Very subtle warm gold

Text:
Ivory/white

Primary accent:
Champagne gold

Secondary:
Muted bronze

========================================================
62. TYPOGRAPHY
========================================================

Use a luxury serif font for major headings.

Use modern sans-serif for:

Navigation
Buttons
Product information
Dashboard
Tables

Headings should feel like luxury perfume advertising.

Avoid excessive uppercase text.

Maintain excellent readability.

========================================================
63. FOOTER
========================================================

Footer:

K ESSENCE logo

About K ESSENCE

Shop

Perfumes
Attars
Oud
Collections
Gift Sets

Customer Support

Contact
Track Order
Shipping
Returns
FAQ

Company

About
Manufacturing
Wholesale
Privacy
Terms

Social

Instagram
Facebook
YouTube

Newsletter:

"Enter your email"

CTA:

JOIN THE K ESSENCE WORLD

========================================================
64. LEGAL PAGES
========================================================

Create placeholders for:

Privacy Policy
Terms & Conditions
Shipping Policy
Return Policy
Refund Policy
Cancellation Policy
Cookie Policy

Do not invent legal claims.

Make content editable through Admin CMS.

========================================================
65. SAMPLE DATA
========================================================

Create realistic DEMO products for development.

Examples:

Royal Oud
Amber Noir
Sandal Musk
Oud Royale
Royal Rose
Musk Noir
Saffron Oud
Velvet Amber

These are placeholder/demo products only.

Clearly structure the database so real K ESSENCE products can replace them.

Do not claim these are actual K ESSENCE products.

Create demo:

Perfumes
Attars
Gift Sets
Combos
Discovery Sets

with:

images
prices
variants
fragrance notes
ratings
reviews
inventory

========================================================
66. ADMIN DEMO DATA
========================================================

Create sample:

Orders
Customers
Products
Inventory
Production Batches
Raw Materials
Invoices
Reviews
Coupons

so the Admin Dashboard looks realistic during development.

Clearly label demo data internally.

========================================================
67. API ARCHITECTURE
========================================================

Use a clean service architecture.

Separate:

Auth
Products
Catalog
Cart
Checkout
Orders
Payments
Inventory
Manufacturing
Shipping
Customers
Reviews
Marketing
Analytics
CMS

Do not put all logic into one giant component.

Use reusable services and hooks.

========================================================
68. ERROR HANDLING
========================================================

Every important operation should have:

Loading state
Success state
Error state
Empty state

Examples:

No products
No orders
Out of stock
Payment failed
Network error
Invalid coupon
Product unavailable

Show elegant error messages.

Do not show raw database errors to customers.

========================================================
69. ADMIN SEARCH
========================================================

Admin global search should search:

Products
Orders
Customers
SKU
Invoice
Batch
Production order

========================================================
70. NOTIFICATIONS
========================================================

Create notification system.

Customer:

Order placed
Payment successful
Order shipped
Out for delivery
Delivered
Refund initiated
Refund completed

Admin:

New order
Payment failed
Low stock
New return
New support ticket
Production QC failure

========================================================
71. PRODUCT RECOMMENDATION
========================================================

Create architecture for recommendations.

Recommend based on:

Fragrance family
Notes
Category
Gender
Price
Purchase history
Browsing behavior

Example:

"If you like Oud Royale, you may also like..."

========================================================
72. FUTURE AI SUPPORT
========================================================

Keep architecture ready for future AI fragrance assistant.

Example:

"Help me find a perfume."

Assistant can ask:

Occasion
Gender
Mood
Fragrance family
Budget
Longevity

Then recommend products.

Do NOT require AI API initially.

Build the architecture so it can be integrated later.

========================================================
73. ADMIN MOBILE RESPONSIVENESS
========================================================

Admin dashboard must also work on tablet/mobile.

Desktop:
full sidebar

Mobile:
collapsible sidebar

Tables should become cards where necessary.

========================================================
74. BRAND EXPERIENCE
========================================================

The website should communicate:

"K ESSENCE is not just selling perfume.

K ESSENCE creates fragrance experiences."

Use storytelling.

Possible phrases:

"THE ART OF FRAGRANCE"

"CRAFTED TO LEAVE A TRACE"

"WEAR YOUR SIGNATURE"

"WHERE TRADITION MEETS MODERN LUXURY"

These are design copy suggestions only and can be changed from CMS.

========================================================
75. IMPORTANT DESIGN RULE
========================================================

DO NOT make this website look like:

Amazon
Flipkart
Meesho
Shopify default theme
Generic perfume template
Generic SaaS dashboard

The ADMIN FUNCTIONALITY may be enterprise-grade like large e-commerce platforms.

But the CUSTOMER WEBSITE must feel like:

LUXURY FRAGRANCE HOUSE
+
CINEMATIC EXPERIENCE
+
3D DIGITAL SHOWROOM

========================================================
76. IMPORTANT 3D RULE
========================================================

3D is a core feature, but usability and performance come first.

Use 3D strategically.

Hero:
YES

Featured products:
YES

Product page:
YES

Every product card:
3D interaction where model exists

Admin:
3D model upload

Mobile:
optimized 3D

Low-end devices:
fallback animation/static optimized image

========================================================
77. NO FAKE FUNCTIONALITY
========================================================

This is a real production-oriented project.

Do NOT create fake buttons that do nothing.

Every visible feature should either:

1. Work,
2. Be connected to a real backend service,
3. Or clearly be marked as a placeholder requiring external configuration.

Examples:

Add to Cart → must work.

Wishlist → must work.

Login → must work.

Orders → must persist.

Inventory → must update.

Payment → must have proper integration architecture.

Admin product creation → must persist.

Coupon → must actually validate.

Stock → must change after order.

========================================================
78. DEVELOPMENT APPROACH
========================================================

Build the application in logical modules.

PHASE 1:
Design system + homepage + 3D experience.

PHASE 2:
Catalog + shop + product pages.

PHASE 3:
Authentication + customer account.

PHASE 4:
Cart + checkout + orders.

PHASE 5:
Payment integration.

PHASE 6:
Admin catalog + inventory.

PHASE 7:
Manufacturing + batches + QC.

PHASE 8:
Billing + shipping.

PHASE 9:
Marketing + analytics.

PHASE 10:
Performance + security + testing.

Do not sacrifice architecture quality just to create a visual prototype quickly.

========================================================
79. FINAL UX REQUIREMENT
========================================================

When a visitor opens the website, the first impression should be:

"Wow, this is a premium perfume brand."

When they hover a perfume:

"Wow, the bottle is interactive."

When they open the product:

"I can explore the fragrance."

When they purchase:

"The checkout is simple."

When the owner logs into Admin:

"I can operate my entire perfume business from here."

That is the target experience.

========================================================
80. FINAL IMPLEMENTATION REQUIREMENT
========================================================

Before considering the project complete, verify:

Customer:

[ ] Homepage
[ ] Navigation
[ ] Search
[ ] Shop
[ ] Filters
[ ] Product detail
[ ] 3D viewer
[ ] Cart
[ ] Wishlist
[ ] Checkout
[ ] Login
[ ] Register
[ ] Account
[ ] Orders
[ ] Order tracking
[ ] Reviews
[ ] Coupons
[ ] Contact
[ ] About
[ ] Manufacturing
[ ] Wholesale
[ ] Gifting
[ ] Fragrance Finder
[ ] Responsive mobile UI

Admin:

[ ] Dashboard
[ ] Products
[ ] Categories
[ ] Collections
[ ] Variants
[ ] 3D model upload
[ ] Inventory
[ ] Warehouses
[ ] Stock movements
[ ] Orders
[ ] Payments
[ ] Billing
[ ] Customers
[ ] Coupons
[ ] Marketing
[ ] Shipping
[ ] Returns
[ ] Reviews
[ ] Support
[ ] CMS
[ ] Analytics
[ ] Manufacturing
[ ] Raw Materials
[ ] Formula/BOM
[ ] Production
[ ] Batch
[ ] QC
[ ] Roles
[ ] Permissions
[ ] Audit logs
[ ] Settings

========================================================
FINAL INSTRUCTION TO LOVABLE
========================================================

First understand the complete architecture and design language.

Then build the project systematically.

Prioritize:

1. Premium visual design
2. Real functionality
3. Strong architecture
4. Responsive design
5. 3D interaction
6. Performance
7. Security
8. Maintainability

The final result must feel like a premium Indian luxury perfume and attar manufacturer with a world-class digital commerce experience.

Brand:
K ESSENCE

Visual identity:
Black + Champagne Gold + Luxury + Cinematic + 3D

Business:
Perfume + Attar Manufacturing + D2C E-Commerce + Future B2B

Build a serious production-ready foundation, not a simple landing page.

Above I am sharing a K Essence Logo and this is the K essence instagram account you can check and review this 2 if needed - https://www.instagram.com/kumar_essence?stkn=cW85ZXhsaHgxbjJ3

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/78cc0668-b8e8-478e-86de-0bc05b12dada).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
