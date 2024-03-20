"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = void 0;
function Card({ className, title, children, href, }) {
    return (React.createElement("a", { className: className, href: `${href}?utm_source=create-turbo&utm_medium=basic&utm_campaign=create-turbo"`, rel: "noopener noreferrer", target: "_blank" },
        React.createElement("h2", null,
            title,
            " ",
            React.createElement("span", null, "->")),
        React.createElement("p", null, children)));
}
exports.Card = Card;
