# WEZZA - Premium Streetwear E-Commerce Platform

## Business Overview

WEZZA is a comprehensive, enterprise-grade e-commerce platform specializing in premium streetwear hoodies. The platform is built to deliver a sophisticated shopping experience for customers while providing powerful management tools for business operations.

**Business Model:** Direct-to-consumer premium streetwear
**Primary Product:** High-quality heavyweight cotton hoodies (350gsm premium fabric)
**Target Market:** Premium streetwear customers in Canada & USA
**Price Point:** Premium tier ($89.99 CAD and up)
**Collections:** Core Collection, Lunar Collection, Custom Orders

---

## Core Business Capabilities

### 1. CUSTOMER-FACING STOREFRONT

#### Shopping Experience
- **Product Catalog**: Browse all products with advanced filtering by color, size, collection, price range, and availability
- **Smart Search**: Real-time search with autocomplete and intelligent ranking that prioritizes exact matches and relevant products
- **Product Collections**: Organized into Core, Lunar, and Customizable collections for easy discovery
- **Product Details**: High-quality image galleries, comprehensive size guides, fabric specifications, and care instructions
- **AI-Powered Recommendations**: Personalized product suggestions based on browsing history, purchases, and customer preferences
- **Related Products**: Similarity-based suggestions to increase discovery and average order value
- **Recently Viewed**: Track customer browsing behavior for easy return to products
- **Wishlist System**: Authenticated users can save products for later purchase
- **Product Reviews & Ratings**: Customer review system with verified purchase badges and community helpful votes
- **Size Recommendation Tool**: Personal sizing profiles based on height, weight, and chest measurements
- **Real-Time Stock Availability**: Live inventory tracking with low-stock indicators
- **Stock Waitlist**: Email notification system when out-of-stock items become available

#### Shopping Cart & Checkout
- **Persistent Shopping Cart**: Saves cart in browser and syncs with account for seamless cross-device experience
- **Free Shipping Threshold**: Visual progress indicator showing path to $100 CAD free shipping
- **Secure Checkout**: E-transfer payment system with manual verification
- **Multiple Payment Methods**: E-transfer (Interac) for Canadian customers
- **Saved Payment Methods**: Returning customers can store payment methods for faster checkout
- **Guest Checkout**: Purchase without account creation required
- **Quick Buy**: Single-click checkout for fast purchases
- **Cart Abandonment Tracking**: Automatic tracking for recovery campaigns

#### Custom Orders
- **Custom Hoodie Design**: Customers can request unique designs, colors, and graphics
- **Design Upload**: Support for mockups, sketches, and reference images
- **Quote System**: Admin reviews requests and provides pricing within 24 hours
- **Low Minimum Order**: Starting at just 1 piece ($89.99 CAD minimum)
- **Production Timeline**: 2-3 weeks for custom production plus shipping

### 2. CUSTOMER ACCOUNT MANAGEMENT

#### User Accounts
- **Secure Registration & Login**: Email/password authentication with industry-standard security
- **Two-Factor Authentication (2FA)**: Optional TOTP-based 2FA with QR code setup for enhanced security
- **Advanced Password Security**:
  - Strong password requirements (8+ characters, mixed case, numbers, special characters)
  - Real-time password strength analysis
  - Password breach checking against known compromised passwords (HaveIBeenPwned integration)
  - Password history tracking to prevent reuse
- **Account Lockout Protection**: Automatic lockout after 5 failed login attempts (15-minute duration)
- **Profile Management**: Update name, email, profile picture, and preferences
- **Saved Addresses**: Store multiple shipping addresses with default selection
- **Order History**: Complete history of all past orders with tracking information
- **Order Tracking**: Real-time shipment tracking with carrier and tracking number
- **Self-Service Account Deletion**: Customer-initiated account deletion with complete data purging

### 3. ORDER MANAGEMENT & FULFILLMENT

#### Order Processing
- **Comprehensive Order Statuses**: Pending → Processing → Shipped → Delivered → Completed / Cancelled
- **Status History Tracking**: Full audit trail of order status changes with timestamps and notes
- **Automatic Email Notifications**:
  - Order confirmation immediately after purchase
  - Shipping updates with tracking information
  - Delivery confirmation
- **Multi-Carrier Tracking**: Support for Canada Post, UPS, and FedEx
- **Return Request System**: Customer-initiated returns with photo uploads and detailed reason tracking
- **Return Management Workflow**: Admin approval/rejection process with refund handling

#### Shipping
- **Free Shipping**: Automatic free shipping on orders over $100 CAD
- **Shipping Regions**: Canada and United States
- **Delivery Estimates**: 5-7 business days for standard orders
- **Custom Order Timeline**: 2-3 weeks production time plus standard shipping

---

## Business Management Features

### 4. USER ROLES & PERMISSIONS

The platform supports a sophisticated three-tier permission system:

#### Customer (Default Role)
- Browse and purchase products
- Create account, save addresses and payment methods
- View order history and track shipments
- Leave reviews and manage wishlist
- Request custom orders
- Submit return requests

#### Collaborator (Limited Admin)
- View assigned products only
- Update product information for assigned products
- Cannot create/delete products
- Cannot access financial data or customer information
- **Use Case**: Designers or external partners managing specific product lines

#### Admin (Full Control)
- Complete access to all admin features
- Manage products, inventory, orders, and customers
- Configure site content and images
- Manage user roles and permissions
- View analytics and security logs
- Full business control

### 5. PAYMENT & FINANCIAL MANAGEMENT

#### Payment Processing
- **E-Transfer Integration**: Free payment processing via e-transfer
- **Webhook Automation**: Automatic order creation upon successful payment
- **Idempotency Protection**: Prevents duplicate orders from webhook retries
- **Saved Payment Methods**: Customers can securely save cards for faster checkout
- **Multi-Currency Support**: Currently CAD (expandable to other currencies)
- **Refund Processing**: Issue full or partial refunds through admin panel

#### Revenue Tracking
- **Total Revenue Dashboard**: All-time and filtered revenue reports
- **Order Analytics**: Track order volume and average order value
- **Product Performance**: Identify which products generate the most revenue
- **Collection Performance**: Track sales by collection (Core, Lunar, Custom)
- **Customer Lifetime Value**: Track total spending per customer

### 6. INVENTORY MANAGEMENT

#### Stock Control
- **SKU-Level Tracking**: Track inventory by product AND size
- **Size-Specific Quantities**: Separate stock counts for S, M, L, XL, XXL
- **Low Stock Alerts**: Configurable threshold warnings (default: 5 units)
- **Automatic Availability Updates**: Out-of-stock products automatically marked unavailable
- **Waitlist Management**: Queue customers for restock notifications
- **Automatic Restock Emails**: Bulk email to waitlist when items return to stock
- **Inventory History**: Track stock changes over time

#### Admin Inventory Tools
- **Bulk Updates**: Update multiple SKUs simultaneously
- **CSV Import/Export**: Bulk inventory management capabilities
- **Real-Time Sync**: Inventory updates reflect immediately on storefront

### 7. CUSTOMER RELATIONSHIP MANAGEMENT

#### Customer Database
- **Comprehensive Customer Profiles**:
  - Name, email, registration date
  - Total orders and total lifetime spending
  - Last purchase date
  - Account status (active, locked)
  - Role assignment
- **Customer Segmentation**:
  - By purchase history
  - By order value
  - By activity level
  - By collection preference
- **Advanced Search & Filter**: Find customers by email, name, order count, spending

#### Customer Communication
- **Order Confirmations**: Automatic emails with complete order details and tracking
- **Shipping Notifications**: Automated emails when orders ship with tracking links
- **Delivery Confirmations**: Automatic emails when orders are delivered
- **Custom Order Responses**: Direct communication for custom design quotes
- **Support Email**: Direct communication via wezza28711@gmail.com

### 8. EMAIL MARKETING AUTOMATION

The platform includes sophisticated automated email campaigns:

#### Welcome Series
- Immediate welcome email with brand introduction
- Day 3 follow-up with style tips and collection overview
- Scheduled engagement emails

#### Cart Abandonment Recovery
- Automatic tracking of carts abandoned for 24+ hours
- Reminder email sent after 24 hours
- Includes cart contents, total, and direct checkout link
- Recovery tracking to measure campaign effectiveness

#### Post-Purchase Engagement
- Day 7: Review request email
- Encourage Instagram sharing (@wezza)
- Direct link to review submission page
- Cross-sell opportunities with personalized recommendations

#### Restock Notifications
- Automatic emails when waitlisted items return to stock
- Batch processing to manage email delivery limits
- Time-limited urgency messaging to drive conversions

#### Lifecycle Email Automation
- Order confirmation
- Shipping notification with tracking
- Delivery confirmation
- Return confirmation and updates

#### Email Management
- **Email Log**: Track all sent emails with delivery status, opens, and clicks
- **Campaign Analytics**: Measure open rates, click rates, and conversion rates
- **Template Management**: Admin-editable email templates
- **Dynamic Variables**: Personalized content (customer name, order details, etc.)
- **Unsubscribe Management**: One-click unsubscribe with secure token-based system

#### Automated Scheduling
- Automated cart abandonment processing via cron jobs
- Post-purchase email scheduling
- Restock notification batching
- Email queue management

### 9. ANALYTICS & REPORTING

#### Business Metrics Dashboard
- **Revenue Analytics**:
  - Total revenue (all-time and filtered periods)
  - Revenue by collection
  - Revenue trends over time
  - Average order value

- **Order Metrics**:
  - Total orders processed
  - Pending orders requiring fulfillment
  - Order status breakdown
  - Conversion rate tracking

- **Customer Metrics**:
  - Total customer count
  - New customer acquisition rate
  - Customer lifetime value
  - Repeat purchase rate

- **Product Performance**:
  - Best-selling products
  - Revenue by individual product
  - Inventory turnover rates
  - Low-stock product alerts

- **Marketing Metrics**:
  - Popular search queries
  - Search-to-purchase conversion
  - Failed searches (no results)
  - Email campaign performance

#### Admin Dashboard
- Quick stats overview (revenue, orders, customers, pending tasks)
- Recent orders feed
- Low-stock alerts
- Quick access to all management tools

---

## Security & Compliance

### 10. ENTERPRISE-GRADE SECURITY

#### Authentication Security
- **Strong Password Requirements**: 8+ characters with mixed case, numbers, and special characters
- **Password Strength Analysis**: Real-time feedback using industry-standard zxcvbn library
- **Breach Detection**: Integration with HaveIBeenPwned API using k-anonymity for privacy
- **Password History**: Prevents reusing recent passwords
- **Secure Hashing**: bcrypt with salt for all password storage
- **Two-Factor Authentication**: TOTP (compatible with Google Authenticator, Authy, etc.)

#### Account Protection
- **Rate Limiting**: Maximum 5 login attempts per 15 minutes
- **Account Lockout**: Automatic 15-minute lockout after failed login attempts
- **Session Management**: 30-day sessions with 24-hour token refresh
- **Secure Cookies**: HttpOnly, SameSite=Lax, Secure in production
- **Prefixed Session Tokens**: __Secure- prefix in production environment

#### API Security
- **CSRF Protection**: Token-based CSRF protection on all state-changing requests
- **Advanced Rate Limiting**:
  - Redis-based distributed rate limiting (production)
  - In-memory fallback for development
  - Configurable limits per endpoint
  - Standard rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining)
- **IP Whitelisting**: Optional admin panel IP restriction with CIDR notation support
- **Input Validation**: Zod schema validation on all user inputs
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **XSS Protection**: Automatic HTML escaping on all user-generated content

#### Data Protection
- **Email Sanitization**: Automatic removal of injection attacks from email inputs
- **Data Encryption**: Sensitive data encrypted at rest (2FA secrets, etc.)
- **PCI Compliance**: No credit card data stored locally (handled entirely by Stripe)
- **Account Deletion**: Complete data purging on user request
- **Password Change Tracking**: Audit logs for all password modifications

#### Comprehensive Audit Logging
Every significant action is logged for security monitoring and compliance:

- **Authentication Events**: Login, logout, 2FA setup/removal, password changes
- **User Management**: User creation, updates, deletion, role changes
- **Product & Inventory**: All product and inventory modifications
- **Order Management**: Order status changes, refunds, cancellations
- **Content Management**: Site content updates, collection changes
- **Email Campaigns**: Campaign sends, template modifications
- **Security Events**: Rate limit triggers, unauthorized access attempts

**Audit Log Data Includes**:
- Action type and timestamp
- User ID and email
- Resource type and ID
- IP address and user agent
- Before/after values (metadata)
- Severity level (info, warning, critical)

#### Security Monitoring
- Real-time critical event alerts
- Failed login attempt tracking
- Suspicious activity detection
- Admin action monitoring
- IP-based threat detection

---

## Advanced Features

### 11. AI-POWERED PERSONALIZATION

#### Personalized Product Recommendations
- **User Behavior Tracking**: Analyzes browsing history, purchases, wishlist, and reviews
- **Smart Recommendation Algorithm**:
  - Identifies favorite collections and colors
  - Avoids recommending already-purchased items
  - Prioritizes wishlist items
  - Weighs featured and bestseller status
  - Matches similar products by collection, price range, colors, and tags
- **Use Cases**:
  - Homepage personalized section
  - Product page "You May Also Like"
  - Post-purchase recommendations in emails

#### Smart Search System
- **Weighted Ranking Algorithm**:
  - Title match (100 points)
  - Exact match bonus (+50 points)
  - Starts-with bonus (+25 points)
  - Collection match (80 points)
  - Color match (60 points)
  - Tag match (40 points)
  - Description match (20 points)
- **Search Suggestions**: Real-time autocomplete as customers type
- **Search History Tracking**: Analytics for improving product discovery

#### Intelligent Size Recommendations
- **Personal Sizing Profile**: Height, weight, chest measurements
- **Fit Preference**: Slim, regular, or oversized fit
- **Calculated Recommendations**: Algorithm suggests optimal size for each customer
- **Detailed Size Guide**: Comprehensive measurements for each product

### 12. DYNAMIC CONTENT MANAGEMENT

Business owners can edit ALL site content without touching code:

#### Editable Text Content
- Navigation labels and menu items
- Hero section headlines and descriptions
- Homepage section content
- Footer content and links
- Product page copy
- Email templates
- FAQ content
- Custom order form text

#### Editable Site Images
- Hero banners and featured images
- Instagram gallery integration
- About page imagery
- Collection banner images
- Product images via Cloudinary

#### Email Template Editor
- Customize all transactional emails
- Edit marketing email content
- Personalization variables
- Preview before sending

#### Collection Management
- Create new product collections
- Organize products into collections
- Feature collections on homepage
- Collection-specific banners and descriptions

### 13. ADVANCED ADMIN CAPABILITIES

#### Product Management
- **Complete Product Creation**: Images, variants, pricing, descriptions
- **Bulk Operations**: Update multiple products simultaneously
- **Product Collaborators**: Assign specific users to manage specific products
- **Featured Products**: Choose which products appear on homepage
- **Collection Assignment**: Organize products into multiple collections

#### User Management
- **Role Assignment**: Promote customers to collaborators or admins
- **Account Controls**: Lock/unlock accounts, view detailed activity
- **Collaborator Workflow**: Assign specific products to collaborator users
- **Customer Insights**: View complete purchase history, order value, activity timeline

#### Order Management
- **Comprehensive Order Dashboard**: View all orders with advanced filtering and search
- **Status Updates**: Change order status with automatic customer email notifications
- **Tracking Management**: Add tracking numbers and carrier information
- **Return Processing**: Review and approve/reject return requests with notes
- **Refund Processing**: Issue full or partial refunds via Stripe integration

#### Security Dashboard
- **Audit Log Viewer**: Search and filter all security events
- **Failed Login Monitor**: Track unauthorized access attempts
- **Critical Event Alerts**: Real-time notifications for security issues
- **User Activity Tracking**: Monitor user actions across the platform
- **IP Monitoring**: Track and restrict access by IP address with CIDR support

---

## Integrations & Technology

### 14. THIRD-PARTY INTEGRATIONS

#### Stripe (Payment Processing)
- Checkout Sessions with hosted checkout pages
- Webhook processing for automated order fulfillment
- Saved payment methods
- Refund processing
- Payment intent tracking

#### Resend (Email Services)
- Transactional emails (orders, shipping, etc.)
- Marketing emails (cart abandonment, post-purchase)
- Batch email sending
- Email tracking (opens, clicks)

#### Cloudinary (Image Management)
- Product image uploads with optimization
- Image optimization and global CDN delivery
- Custom design image storage
- Site content image hosting

#### Upstash Redis (Caching & Rate Limiting)
- Distributed rate limiting in production
- Session storage and caching
- Cache layer for frequently accessed data
- Automatic fallback to in-memory if unavailable

#### NextAuth.js (Authentication)
- Secure session management
- JWT token handling
- Credential-based login
- OAuth ready (Google, GitHub - infrastructure prepared)

### 15. TECHNOLOGY STACK

**Frontend:**
- Next.js 14 (React) with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- shadcn/ui component library

**Backend:**
- Next.js API Routes
- Node.js runtime
- PostgreSQL database
- Prisma ORM

**State Management:**
- Zustand (shopping cart)
- React Context (user sessions)

**Infrastructure:**
- Vercel deployment ready
- Redis caching (optional)
- Cloudinary CDN
- Stripe payment infrastructure

---

## Business Workflows

### 16. CUSTOMER JOURNEY EXAMPLES

#### New Customer Journey
1. Lands on homepage → sees hero banner, featured products, Instagram gallery
2. Uses smart search or filters to find products
3. Views product details, size guide, customer reviews
4. Adds items to cart (automatically persists)
5. Can create account or checkout as guest
6. Completes secure Stripe checkout
7. Receives immediate order confirmation email
8. Order appears in account history (if logged in)
9. Receives shipping notification with tracking link
10. Receives delivery confirmation
11. After 7 days: receives review request email with personalized recommendations

#### Custom Order Journey
1. Visits /custom page for custom designs
2. Fills out detailed design request form (color, size, design notes, uploads image)
3. Submits form → admin receives email notification
4. Admin reviews request and sends pricing quote via email (within 24 hours)
5. Customer approves quote → admin creates custom order in system
6. 2-3 weeks production time
7. Order ships → customer receives tracking email
8. Delivery → customer enters post-purchase email series

#### Cart Abandonment Recovery
1. Customer adds items to cart but doesn't complete checkout
2. System tracks abandoned cart
3. After 24 hours, automatic reminder email sent
4. Email includes cart contents, total, direct checkout link
5. Customer clicks link → returns to cart with items preserved
6. Completes purchase → system marks cart as recovered

### 17. ADMIN WORKFLOW EXAMPLES

#### New Product Launch
1. Create product in admin panel (title, description, images, pricing)
2. Upload images to Cloudinary via admin interface
3. Set inventory levels by size (S, M, L, XL, XXL)
4. Assign to collection (Core, Lunar, etc.)
5. Mark as "featured" for homepage visibility
6. Product appears on storefront immediately
7. Monitor sales via analytics dashboard
8. Update inventory as sales occur
9. Trigger restock notifications when inventory refilled

#### Order Fulfillment Process
1. New order arrives → Stripe webhook creates order in database automatically
2. Order appears in admin dashboard with "Processing" status
3. Admin prepares physical shipment
4. Admin updates order status to "Shipped" with tracking number and carrier
5. Customer receives automated shipping email with tracking link
6. Tracking updates display in customer account
7. When delivered, admin marks order "Delivered"
8. Customer receives delivery confirmation email
9. After 7 days: customer automatically receives review request email

#### Managing Returns
1. Customer submits return request with reason and photos
2. Admin receives notification of new return request
3. Admin reviews request, photos, and order history
4. Admin approves or rejects with notes
5. If approved: customer receives return shipping instructions
6. When item received: admin processes refund via Stripe
7. Customer receives refund confirmation email
8. Order status updates to "Returned"

---

## Business Metrics & KPIs

### 18. TRACKED METRICS

The platform automatically tracks comprehensive business metrics:

#### Revenue Metrics
- Total revenue (all-time and filtered periods)
- Revenue by collection (Core, Lunar, Custom)
- Average order value
- Revenue per customer
- Revenue growth trends

#### Order Metrics
- Total orders processed
- Pending orders requiring fulfillment
- Order status distribution
- Order volume trends over time
- Conversion rate (visits to completed orders)

#### Customer Metrics
- Total customer count
- New customer acquisition rate
- Repeat customer percentage
- Customer lifetime value
- Customer acquisition cost (when marketing integrated)

#### Product Metrics
- Best-selling products by volume and revenue
- Worst-performing products
- Low-stock products requiring reorder
- Most-reviewed products
- Highest-rated products
- Wishlist frequency (most-wanted items)

#### Marketing Metrics
- Email open rates by campaign type
- Email click rates and engagement
- Cart abandonment rate
- Cart recovery rate and revenue recovered
- Search-to-purchase conversion
- Popular search terms and trends

#### Operational Metrics
- Average order fulfillment time
- Return rate and return reasons
- Customer support volume
- Failed login attempts (security monitoring)
- Inventory turnover rate

---

## Scalability & Growth

### 19. BUILT FOR GROWTH

#### Infrastructure Scalability
- **Redis Integration**: Distributed caching and rate limiting for high traffic
- **Database Indexing**: Optimized queries with compound indexes for performance
- **Image CDN**: Cloudinary provides global image delivery
- **Webhook Idempotency**: Prevents duplicate orders under heavy load
- **Session Management**: Stateless JWT sessions for horizontal scaling
- **API Rate Limiting**: Protects against abuse and ensures fair resource usage

#### Growth-Ready Features
- **Multi-Currency Support**: Infrastructure ready (currently CAD, easily expandable)
- **International Shipping**: Simple to expand beyond Canada/USA
- **OAuth Providers**: Ready for Google, Facebook, Apple login
- **Wholesale Portal**: Collaborator role supports B2B operations
- **Affiliate Program**: Tracking infrastructure in place for affiliate marketing
- **Multi-Vendor Marketplace**: Product collaborator system supports multi-vendor expansion

---

## Summary

**WEZZA is a comprehensive, enterprise-grade e-commerce platform delivering:**

✅ **Complete E-Commerce Engine** - Product catalog, shopping cart, secure checkout, order management
✅ **Advanced Customer Features** - AI personalization, recommendations, wishlist, reviews, size tools
✅ **Powerful Admin Panel** - Product, inventory, order, customer, and content management
✅ **Email Marketing Automation** - Cart recovery, lifecycle emails, restock alerts, campaigns
✅ **Enterprise Security** - 2FA, audit logging, rate limiting, CSRF protection, breach checking
✅ **Custom Order System** - Quote-based custom designs with streamlined approval workflow
✅ **Smart Inventory** - Size-level tracking, low-stock alerts, automated waitlist notifications
✅ **Analytics & Reporting** - Comprehensive revenue, order, customer, and product analytics
✅ **Three-Tier Permissions** - Customer, Collaborator, and Admin role management
✅ **Production-Ready** - Stripe payments, Resend emails, Cloudinary images, Redis caching

**This is a fully functional, production-ready e-commerce platform with sophisticated features that rival major platforms like Shopify, but with complete custom control, ownership, and extensibility. The platform is designed to scale from startup to enterprise while maintaining security, performance, and user experience.**

---

## Platform Statistics

- **50+ Features**: Comprehensive feature set covering all e-commerce needs
- **3 User Roles**: Customer, Collaborator, Admin with granular permissions
- **10+ Automated Emails**: Complete lifecycle and marketing automation
- **20+ Analytics Metrics**: Comprehensive business intelligence
- **Enterprise Security**: Military-grade security with audit logging and 2FA
- **100% Type-Safe**: Full TypeScript implementation
- **PCI Compliant**: Secure payment processing via Stripe
- **Mobile Responsive**: Perfect experience on all devices

---

## Business Contact

**Email**: wezza28711@gmail.com
**Instagram**: @wezza
**Platform**: Built with Next.js, TypeScript, PostgreSQL, Stripe

---

**Last Updated**: January 2025
**Version**: 1.0 Production
**Status**: Fully Operational
