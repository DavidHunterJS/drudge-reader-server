# Drudge Reader

Drudge Reader is a dynamic web application that scrapes the current news stories from the Drudge Report website. This tool not only updates the links in real-time but also enhances the user experience by providing additional features such as link previews and an integrated discussion forum.

## Features

- **Real-Time Link Updates:** The application continuously scrapes the Drudge Report to provide users with the latest news stories as they are posted.
- **Link Previews:** Hovering over a news link displays a screenshot of the corresponding webpage, giving users a quick preview of the content.
- **Integrated Chat Forum:** Users can discuss news stories they care about in a dedicated forum powered by Flarum, a modern and fast forum software.

## Getting Started

### Prerequisites

To run Drudge Reader, you’ll need to have the following installed on your system:

- **Node.js:** JavaScript runtime environment
- **npm:** Node package manager
- **Flarum:** Forum software to enable user discussions

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/drudge-reader.git
    cd drudge-reader
    ```

2. **Install the necessary dependencies for the server:**

    ```bash
    cd server
    npm install
    ```

3. **Install the necessary dependencies for the client:**

    ```bash
    cd ../client
    npm install
    ```

4. **Set up the Flarum forum:**

    Follow the [Flarum installation guide](https://docs.flarum.org/install.html) to set up your forum. Ensure that it is running and accessible.

5. **Configure environment variables:**

    Create a `.env` file in the `server` directory and add the necessary configurations. For example:

    ```env
    FLARUM_URL=http://your-flarum-site.com
    ```

6. **Start the server:**

    ```bash
    cd ../server
    npm start
    ```

7. **Start the client:**

    ```bash
    cd ../client
    npm start
    ```

    The application should now be running on `http://localhost:3000`.

### Usage

- **Browsing News Links:** Open the application in your web browser. The latest news links from the Drudge Report will be displayed.
- **Link Previews:** Hover over any news link to see a screenshot of the webpage.
- **Forum Discussions:** Click on the "Discuss" button next to any news link to join the conversation in the Flarum forum.

## Project Structure

- **/client:** Contains the frontend source code for the application.
- **/server:** Contains the backend source code for the application, including the Cheerio.js scraper and Puppeteer for link previews.
- **/public:** Contains static assets like images and HTML files.
- **.env:** Environment variables for configuration.

## Upcoming Features

- **Docker Support:** A Docker version of the application will be available soon, simplifying the setup and deployment process.

## Contributing

We welcome contributions to Drudge Reader! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push your branch to your fork.
4. Submit a pull request with a description of your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Drudge Report](https://www.drudgereport.com) for providing the news content.
- [Flarum](https://flarum.org) for the forum software.
- [Node.js](https://nodejs.org) and [npm](https://www.npmjs.com) for the development environment.
- [Cheerio.js](https://cheerio.js.org) for web scraping capabilities.
- [Puppeteer](https://pptr.dev) for generating link previews.
