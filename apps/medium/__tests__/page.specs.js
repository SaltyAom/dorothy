"use strict";
/**
 * @jest-environment jsdom
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const page_1 = __importDefault(require("@app/page"));
const react_1 = require("@testing-library/react");
describe('App', () => {
    it('renders without crashing', () => {
        const { baseElement } = (0, react_1.render)(React.createElement(page_1.default, null));
        expect(baseElement).toBeTruthy();
    });
});
