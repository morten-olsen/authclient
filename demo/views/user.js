module.exports = ({
  picture,
  name,
}) => `
  <div>
    <div id="icon">
      <img src="${picture}" />
    <div>
    <div id="name">
      ${name}
    </div>
    <button id="logout">
      Logout
    </button>
  </div>
`;