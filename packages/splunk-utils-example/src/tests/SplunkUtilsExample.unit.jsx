/* eslint-env jest */

import React from 'react';
import { assert } from 'chai';
import Enzyme, { mount } from 'enzyme';
import EnzymeAdapterReact16 from 'enzyme-adapter-react-16';
import SplunkUtilsExample from '../SplunkUtilsExample';

// This sets up the enzyme adapter
const adapter = new EnzymeAdapterReact16();
Enzyme.configure({ adapter });

describe('SplunkUtilsExample', () => {
    it('renders with default name', () => {
        const wrapper = mount(<SplunkUtilsExample />);
        assert.include(wrapper.text(), 'Hello, User!');
        wrapper.unmount();
    });

    it('renders with custom name', () => {
        const wrapper = mount(<SplunkUtilsExample name="World" />);
        assert.include(wrapper.text(), 'Hello, World!');
        wrapper.unmount();
    });

    it('increases the counter when button is clicked', () => {
        const wrapper = mount(<SplunkUtilsExample name="World" />);
        assert.equal(wrapper.state('counter'), 0);
        wrapper.find('button').simulate('click');
        assert.equal(wrapper.state('counter'), 1);
        wrapper.unmount();
    });
});
