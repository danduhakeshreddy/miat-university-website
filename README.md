# Meridian Institute of Advanced Technology (MIAT)

A responsive concept university website and front-end exercise suite built with semantic HTML, external CSS, and vanilla JavaScript. Institutional details, statistics, student records, and transactions are illustrative. Internal page links use client-side navigation with browser back and forward support; every page also remains directly addressable.

## Open the site

Run `node dev-server.mjs` and open `http://localhost:4174`. No build tools or external libraries are required.

## Pages

- Home, About, Student Profile, Courses, Gallery, Campus Tour, Destinations, and Campus News.
- Admissions, Health Center, Student and Faculty Login, Symposium, Workshop, Staff Registration, and Marks Calculator.
- Campus Store and three checkout steps.
- Student Search, ATM Simulator, Mouse and Keyboard Labs, Online Examination, Student Portal, Contact, and a friendly 404 page.
- `basics/` contains 13 standalone HTML assignment exercises and navigation stubs.

## Demo credentials

- Student: `student01` / `Student@123`
- Faculty: `faculty01` / `Faculty@123`

The login page is a front-end demonstration and does not authenticate against a server.

## Media and validation notes

Campus buildings, library, and collaboration photos use [Unsplash](https://unsplash.com/). The campus walkway photo is from [Western University](https://www.uwo.ca/vpfinance/). The electronics lab image is from [UTEC](https://utec.edu.pe/facultad/facultad-de-ingenieria), and the robotics project image is from the [Research Triangle AI Society](https://research-triangle.ai/). Store thumbnails now match their product, with photos from [Luxe Meadow](https://luxemeadow.co.uk/) and [Daraz](https://www.daraz.lk/). These representative photos do not depict MIAT. The homepage, admissions, and symposium use clearly labeled static photo preview templates; no video is loaded. Optional audio elements have text instructions or transcripts where their files are absent.

Workshop email validation follows the MIAT brand and accepts `username@miat.ac.in`. Checkout and payment flows are simulations and do not collect payment.

## Assignment coverage

| Assignment | File(s) |
|---|---|
| University home and slider | `index.html` |
| About, text formatting, leadership | `about.html`, `courses.html` |
| Student profile, nested lists | `profile.html`, `basics/nested-lists.html` |
| Nature gallery and campus slideshows | `gallery.html`, `campus-tour.html`, `destinations.html` |
| Responsive newspaper | `news.html` |
| HTML5 application form | `admissions.html` |
| Patient registration and CSS layout | `health-center.html` |
| Login with audio | `login.html` |
| Symposium media and registration | `symposium.html` |
| MIAT workshop email validation | `workshop.html` |
| Staff employee ID validation | `staff-register.html` |
| Marks calculator | `marks-calculator.html` |
| Store search and cart | `store.html` |
| Checkout delivery, payment, summary | `checkout-delivery.html`, `checkout-payment.html`, `checkout-summary.html` |
| Search, ATM, mouse and keyboard events, exam | `student-search.html`, `atm.html`, `lab-mouse.html`, `lab-keyboard.html`, `exam.html` |
| Student portal and contact | `portal.html`, `contact.html` |
| Standalone basics exercises | `basics/` |
