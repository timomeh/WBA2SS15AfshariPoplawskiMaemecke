WBA2 Team 21 [![Build Status][travis-image]][travis-url]
============

## Developing with Tests

First, if you haven't already installed the dev-dependencies, run:

```
npm install -d
```

Now run the following command to execute the test:

```
npm test
```

**Test Output explained**

```
  /api/users
    POST /
      ✓ should create a new user with 201 Created
      ✓ should increment the id by +1
    GET /:id
      ✓ should return a created user
      1) should return a 404 if no user is found
    PUT /:id
      ✓ should update a users value

  4 passing (93ms)
  1 failing

  1) /api/users GET /:id should return a 404 if no user is found:
     Error: expected 404 "Not Found", got 200 "OK"
      at net.js:1277:10
```

First you will see a list of all completed tests. Each test with a checkmark was successful. A test without a checkmark failed.

In this example the test `/api/users GET /:id should return a 404 if no user is found` failed. (This of course means `GET /api/users/:id`). At the bottom of the test you'll see *why* the test has failed. He *»expected HTTP Status 404 but got 200 instead«*.

All failed tests and explanations are numbered consecutively.

It's our goal to eliminate all failed tests and get a nice green "build passed" bagde.

## Projektexposé

Name: friendar  
Thema: Social Calender

Jeder kennt es! Man möchte etwas unternehmen, aber im Chat mit den Freunden reagiert niemand – und wenn jemand antwortet, ist nicht jedem klar, wer mitkommt und wo es eigentlich hingeht. Am Schluss wird dann gar nichts unternommen, weil große Verwirrung herrscht.  
In diesem Fall kommt unser *Social Calender* zum Einsatz. Er ist ein Kalender, den man mit den eigenen Freunden teilen kann. In diesem Kalender kann man eintragen, wann und ggf. wohin man ausgehen möchte. Die Freunde können dann angeben, dass sie ebenfalls kommen. Als Beispiel legt man ein Event an, dass man morgen Abend in das Brauhaus gehen möchte. Die eigenen Freunde können das einsehen und sich ebenfalls für diese Event eintragen.


[travis-image]: http://img.shields.io/travis/timomeh/WBA2SS15AfshariPoplawskiMaemecke.svg?style=flat-square
[travis-url]: https://travis-ci.org/timomeh/WBA2SS15AfshariPoplawskiMaemecke