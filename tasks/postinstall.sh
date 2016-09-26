echo "**** NPM post install ****"

if [ "$NODE_ENV" = "TEST" ]
then
  npm run test
  npm run bump
fi
