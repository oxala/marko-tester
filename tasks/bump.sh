echo "**** NPM bump version ****"

branch=`echo $GIT_BRANCH | cut -d"/" -f2`
git checkout $branch

npm version patch --no-git-tag-version;

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

git add package.json
git commit -m "Jenkins: Bump to $PACKAGE_VERSION"
git tag $PACKAGE_VERSION
git push && git push --tags
exitCode=$?
