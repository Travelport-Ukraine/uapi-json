# Contributing

### Bugs and Improvements

We use the issue tracker to keep track of bugs and improvements to uapi-json itself, its examples, and the documentation. We encourage you to open issues to discuss improvements, architecture, theory, internal implementation, etc. If a topic has been discussed before, we will ask you to join the previous discussion.

### Development
We love pull requests from everyone.

To start working with code first visit [issue tracker](https://github.com/Travelport-Ukraine/uapi-json/issues) and after that tell us what are you going to do (maybe we are currently working on it).

Than follow next steps
1. Fork the repo:

        git clone git@github.com:your-username/uapi-json.git
        
2. Create a new feature branch based off the master branch.
3. Add some changes to the code.
4. [Make sure all tests pass and there are no linting errors.
](#checks).
5. Submit a pull request, referencing any issues it addresses.

P.S don't forget to add examples and docs.

<a name="checks"></a>
### Testing and Linting
Please check that all tests and linting are ok.

To run linting:

    npm run lint
    
To run tests:

    npm run test

