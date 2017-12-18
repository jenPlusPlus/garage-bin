/* eslint-disable no-undef */

const getAllItems = () => {
  fetch('/api/v1/items')
    .then(items => items.json())
    .then((parsedItems) => {
      if (parsedItems.garageItems.length) {
        parsedItems.garageItems.forEach((item) => {
          console.log('item: ', item);
          // add item to page
        });
      }
    })
    .catch(error => console.error({ error }));
};

const enableSubmitButton = () => {
  if ($('#name-input').val() !== ''
  && $('#cleanliness-input option:selected').val() !== 'Choose Cleanliness'
  && $('#reason-input').val() !== '') {
    $('#submit-button').attr('disabled', false);
  } else {
    $('#submit-button').attr('disabled', true);
  }
};

const submitGarageItem = (event) => {
  event.preventDefault();
  const item = {
    name: $('#name-input').val(),
    reason: $('#reason-input').val(),
    cleanliness: $('#cleanliness-input option:selected').val(),
  };

  fetch('/api/v1/items', {
    method: 'POST',
    body: JSON.stringify(item),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(() => {
      // add item to page
    })
    .catch((error) => { throw error; });

  $('#name-input').val('');
  $('#reason-input').val('');
};

window.onload = () => {
  getAllItems();
};

$('#name-input').on('keyup', enableSubmitButton);
$('#reason-input').on('keyup', enableSubmitButton);
$('#cleanliness-input').on('change', enableSubmitButton);

$('#submit-button').on('click', submitGarageItem);
