/* eslint-disable no-undef */

const addItemDetails = () => {
  // change div display to block/inline-block
};

const getCleanlinessCount = async (cleanlinessLevel) => {
  let cleanlinessCount;
  await fetch('/api/v1/items')
    .then(items => items.json())
    .then((parsedItems) => {
      cleanlinessCount = parsedItems.garageItems
        .filter(item => item.cleanliness === cleanlinessLevel).length;
    })
    .catch(error => console.error({ error }));

  // why is the console.log right and the return wrong???
  console.log('cleanlinessCount: ', cleanlinessLevel, cleanlinessCount);
  return cleanlinessCount;
};

const updateCleanlinessDB = async (id, oldCleanliness, cleanliness) => {
  await fetch(`/api/v1/items/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ cleanliness }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then()
    .catch((error) => { throw error; });

  $(`#item-count-${oldCleanliness}`).text(`${getCleanlinessCount(oldCleanliness)}`);
  $(`#item-count-${cleanliness}`).text(`${getCleanlinessCount(cleanliness)}`);
};

const isSelected = (selectedValue, cleanlinessLevel) => {
  if (selectedValue === cleanlinessLevel) {
    return 'selected';
  }
  return '';
};

const appendItem = (item) => {
  let oldCleanlinessLevel;
  $('#garage').append(`
    <div class='garage-item' id='item-${item.id}'>
      <h4 id='item-name-${item.id} class='garage-item-name'>${item.name}</h4>
        <div class='item-details'>
          <p id='item-reason-${item.id}'>Reason for Lingering: ${item.reason}</p>
          <p>To change the item's cleanliness, select a new option below.</p>
          <select id='item-cleanliness-input-${item.id}'>
            <option id='item-sparkling-${item.id}' value="Sparkling" ${isSelected('Sparkling', item.cleanliness)} >Sparkling</option>
            <option id='item-dusty-${item.id}' value="Dusty" ${isSelected('Dusty', item.cleanliness)}>Dusty</option>
            <option id='item-rancid-${item.id}' value="Rancid" ${isSelected('Rancid', item.cleanliness)}>Rancid</option>
          </select>
        </div>
    </div>`);
  $('.garage-item-name').on('click', addItemDetails);
  $(`#item-cleanliness-input-${item.id}`).on('click', () => { oldCleanlinessLevel = $(`#item-cleanliness-input-${item.id}`).val(); });
  $(`#item-cleanliness-input-${item.id}`).on('change', () => updateCleanlinessDB(item.id, oldCleanlinessLevel, $(`#item-cleanliness-input-${item.id}`).val()));
};

const sort = async () => {
  $('.garage-item').remove();
  let sortedArray = [];

  await fetch('/api/v1/items')
    .then(items => items.json())
    .then((parsedItems) => {
      if (parsedItems.garageItems.length) {
        const sortedItems = parsedItems.garageItems.sort((a, b) => {
          const nameA = a.name;
          const nameB = b.name;
          if (nameA < nameB) { return -1; }
          if (nameA > nameB) { return 1; }
          return 0;
        });
        sortedArray = sortedItems.slice();
      }
    })
    .catch(error => console.error({ error }));

  if ($('#sort-button').text() === 'Sort Ascending') {
    sortedArray.forEach((item) => {
      appendItem(item);
    });
    $('#sort-button').text('Sort Descending');
  } else {
    sortedArray.reverse().forEach((item) => {
      appendItem(item);
    });
    $('#sort-button').text('Sort Ascending');
  }
};

const increaseItemCount = (cleanlinessLevel) => {
  const totalCount = parseInt($('#item-count').text(), 10) + 1;
  $('#item-count').text(`${totalCount}`);

  const cleanlinessCount = parseInt($(`#item-count-${cleanlinessLevel.toLowerCase()}`).text(), 10) + 1;
  $(`#item-count-${cleanlinessLevel.toLowerCase()}`).text(cleanlinessCount);
};

const getTotalItemCount = (items) => {
  $('#item-count').text(`${items.length}`);
  $('#item-count-sparkling').text(`${getCleanlinessCount('Sparkling')}`);
  $('#item-count-dusty').text(`${getCleanlinessCount('Dusty')}`);
  $('#item-count-rancid').text(`${getCleanlinessCount('Rancid')}`);
};

const getAllItems = () => {
  fetch('/api/v1/items')
    .then(items => items.json())
    .then((parsedItems) => {
      if (parsedItems.garageItems.length) {
        getTotalItemCount(parsedItems.garageItems);
        parsedItems.garageItems.forEach((item) => {
          appendItem(item);
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
    name: $('#name-input').val().toLowerCase(),
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
  // eslint-disable-next-line consistent-return
    .then((response) => {
      if (response.status === 201) {
        return response.json();
      }
    })
    .then((addedItem) => {
      increaseItemCount(addedItem.garageItem.cleanliness);
      appendItem(addedItem.garageItem);
    })
    .catch((error) => { throw error; });

  $('#name-input').val('');
  $('#reason-input').val('');
};


getAllItems();


$('#name-input').on('keyup', enableSubmitButton);
$('#reason-input').on('keyup', enableSubmitButton);
$('#cleanliness-input').on('change', enableSubmitButton);

$('#submit-button').on('click', submitGarageItem);
$('#sort-button').on('click', sort);
