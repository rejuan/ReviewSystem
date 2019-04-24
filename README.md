[![Build Status](https://travis-ci.com/rejuan/ReviewSystem.svg?token=KhpV8JP1fhyPE49az7dy&branch=master)](https://travis-ci.com/rejuan/ReviewSystem)

# Review System

A fast, simple & powerful RESTful API based Review System, powered by [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [MongoDB](https://www.mongodb.com/) and [mongoose](https://mongoosejs.com/)

## Features

- User - Signup/Signin/Forgot/Change password
- Company - Add/Edit/Delete company
- Review - Add/Edit/Delete reviews, User review list, Company review list
- Response - Company owner can Add/Edit/Delete response according to any review
- Search - Search by company tag or company name
- Suggestion - Support autocomplete feature by tag & company suggestion
- Admin - Suspend/Unsuspend user & company
- Authentication & Authorisation - Used JWT based authentication & authorisation

## TO DO List

- Create API documentation with swagger
- Publish API documentation in apiary

## Getting Started

To get you started you can simply clone the repository:

```
git clone https://github.com/rejuan/ReviewSystem.git
cd ReviewSystem
```

and install the dependencies

```
npm install
```

## Run the Application

#### Run for development with nodemon

```
    npm run dev
```

#### Run for production

```
    npm run start
```

#### Tests

```
    npm run test
```

#### Code coverage

```
    npm run coverage
```

## Authors

- **A M S Rejuan** - _Initial work_ - [github](https://github.com/rejuan)

See also the list of [contributors](https://github.com/rejuan/ReviewSystem/contributors) who participated in this project.

## Contributing

Contributions are more than welcome! Open an [issue](https://github.com/rejuan/ReviewSystem/issues/new) and submit a pull request according to issue.

1. Navigate to the main page of the repository
1. Fork it!
1. Create your feature branch: `git checkout -b new-feature`
1. Commit your changes: `git commit -m 'Add some feature'`
1. Push to the branch: `git push origin new-feature`
1. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
