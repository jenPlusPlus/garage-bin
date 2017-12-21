/* eslint-disable no-undef */

const toggleItemDetails = (itemID) => {
  console.log('clicked: ', itemID);
  $(`#item-details-${itemID}`).toggleClass('hidden-item-details');
  $(`#item-itemID`).toggleClass('expanded');
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

  return cleanlinessCount;
};

const getTotalCount = async () => {
  let totalCount;
  await fetch('/api/v1/items')
    .then(items => items.json())
    .then((parsedItems) => {
      totalCount = parsedItems.garageItems.length;
    })
    .catch(error => console.error({ error }));

  return totalCount;
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

  let oldCleanlinessCount;
  getCleanlinessCount(oldCleanliness)
    .then((result) => {
      oldCleanlinessCount = result;
      $(`#item-count-${oldCleanliness.toLowerCase()}`).text(oldCleanlinessCount);
    })
    .catch((error) => { throw error; });

  let newCleanlinessCount;
  getCleanlinessCount(cleanliness)
    .then((result) => {
      newCleanlinessCount = result;
      $(`#item-count-${cleanliness.toLowerCase()}`).text(newCleanlinessCount);
    })
    .catch((error) => { throw error; });
};

const isSelected = (selectedValue, cleanlinessLevel) => {
  if (selectedValue === cleanlinessLevel) {
    return 'selected';
  }
  return '';
};

const appendItem = (item) => {
  let isHidden = 'hidden';
  if ($('#garage-items-instructions').text() === 'Click here to close the garage!') {
    isHidden = '';
  }
  let oldCleanlinessLevel;
  $('#garage-item-container').append(`
    <div class='garage-item ${isHidden}' id='item-${item.id}'>
      <h4 id='item-name-${item.id}' class='garage-item-name'>${item.name}</h4>
        <div id='item-details-${item.id}' class='item-details hidden-item-details'>
          <p id='item-reason-${item.id}'><span id='reason-label'>Reason for Lingering:</span> ${item.reason}</p>
          <p class='instructions-cleanliness instructions'>To change the item's cleanliness, select a new option below.</p>
          <select id='item-cleanliness-input-${item.id}'>
            <option id='item-sparkling-${item.id}' value="Sparkling" ${isSelected('Sparkling', item.cleanliness)} >Sparkling</option>
            <option id='item-dusty-${item.id}' value="Dusty" ${isSelected('Dusty', item.cleanliness)}>Dusty</option>
            <option id='item-rancid-${item.id}' value="Rancid" ${isSelected('Rancid', item.cleanliness)}>Rancid</option>
          </select>
        </div>
    </div>`);
  $(`#item-cleanliness-input-${item.id}`).on('click', () => { oldCleanlinessLevel = $(`#item-cleanliness-input-${item.id}`).val(); });
  $(`#item-cleanliness-input-${item.id}`).on('change', () => updateCleanlinessDB(item.id, oldCleanlinessLevel, $(`#item-cleanliness-input-${item.id}`).val()));
  $(`#item-name-${item.id}`).on('click', () => toggleItemDetails(item.id));
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

const getTotalItemCount = () => {
  let totalCount;
  getTotalCount()
    .then((result) => {
      totalCount = result;
      $('#item-count').text(totalCount);
    })
    .catch((error) => { throw error; });

  console.log('total: ', total);

  let sparklingCount;
  getCleanlinessCount('Sparkling')
    .then((result) => {
      sparklingCount = result;
      $('#item-count-sparkling').text(sparklingCount);
    })
    .catch((error) => { throw error; });

  let dustyCount;
  getCleanlinessCount('Dusty')
    .then((result) => {
      dustyCount = result;
      $('#item-count-dusty').text(dustyCount);
    })
    .catch((error) => { throw error; });

  let rancidCount;
  getCleanlinessCount('Rancid')
    .then((result) => {
      rancidCount = result;
      $('#item-count-rancid').text(rancidCount);
    })
    .catch((error) => { throw error; });
};

const getAllItems = () => {
  fetch('/api/v1/items')
    .then(items => items.json())
    .then((parsedItems) => {
      if (parsedItems && parsedItems.garageItems.length) {
        getTotalItemCount();
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

const submitGarageItem = async (event) => {
  event.preventDefault();
  const item = {
    name: $('#name-input').val().toLowerCase(),
    reason: $('#reason-input').val(),
    cleanliness: $('#cleanliness-input option:selected').val(),
  };

  await fetch('/api/v1/items', {
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
      appendItem(addedItem.garageItem);
    })
    .catch((error) => { throw error; });
  getTotalItemCount();
  $('#name-input').val('');
  $('#reason-input').val('');
};

const toggleGarageDoor = () => {
  $('img').slideToggle(2000);
  $('#garage-header-container').toggleClass('hidden');
  $('.garage-item').toggleClass('hidden');
  $('#garage-item-container').toggleClass('hidden');
  $('#garage-item-container').toggleClass('visible');
  if ($('#garage-items-instructions').text() === 'Click here to open the garage!') {
    $('#garage-items-instructions').text('Click here to close the garage!');
  } else {
    $('#garage-items-instructions').text('Click here to open the garage!');
  }
};


getAllItems();


$('#name-input').on('keyup', enableSubmitButton);
$('#reason-input').on('keyup', enableSubmitButton);
$('#cleanliness-input').on('change', enableSubmitButton);

$('#submit-button').on('click', submitGarageItem);
$('#sort-button').on('click', sort);

$('#garage-items-instructions').on('click', toggleGarageDoor);
