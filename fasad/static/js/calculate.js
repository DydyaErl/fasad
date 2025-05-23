
document.addEventListener('DOMContentLoaded', function() {
    // Данные для расчетов
    const plasterPrices = {
      'ceresit': { price: 1200, consumption: 6 },
      'knauf': { price: 1000, consumption: 5.5 },
      'weber': { price: 1400, consumption: 5.8 },
      'vetonit': { price: 1300, consumption: 5.7 },
      'bergauf': { price: 1100, consumption: 5.6 },
      'linimax': { price: 950, consumption: 5.4 },
      'other': { price: 1000, consumption: 5.5 }
    };
  
    const insulationPrices = {
      'mineral': {
        30: 350,
        50: 450,
        100: 800
      },
      'penoplast': {
        30: 250,
        50: 300,
        100: 550
      },
      'stone': {
        30: 400,
        50: 500,
        100: 900
      },
      'basalt': {
        30: 450,
        50: 550,
        100: 950
      },
      'extruded': {
        30: 500,
        50: 600,
        100: 1000
      }
    };
  
    // Предустановленные цвета с их HEX значениями
    const presetColors = {
      'Персик': '#FFDAB9',
      'Жёлтый': '#FFF44F',
      'Фисташковый': '#98FF98',
      'Белый': '#FFFFFF',
      'Бирюзовый': '#40E0D0',
      'Слоновая кость': '#FFFFF0'
    };
  
    // Обновляем select с типами утеплителя
    const insulationTypeSelect = document.getElementById('insulation-type');
    if (insulationTypeSelect) {
      insulationTypeSelect.innerHTML = `
        <option value="none">Без утепления</option>
        <option value="mineral">Минеральная вата</option>
        <option value="penoplast">Пенопласт</option>
        <option value="stone">Каменная вата</option>
        <option value="basalt">Базальтовая вата</option>
        <option value="extruded">Экструдированный пенопласт</option>
      `;
    }
  
    // Обновляем select с толщиной утеплителя
    const insulationThicknessSelect = document.getElementById('insulation-thickness');
    if (insulationThicknessSelect) {
      insulationThicknessSelect.innerHTML = `
        <option value="30">30 мм</option>
        <option value="50">50 мм</option>
        <option value="100">100 мм</option>
      `;
    }
  
    // Обновляем select с марками штукатурки
    const plasterTypeSelect = document.getElementById('plaster-type');
    if (plasterTypeSelect) {
      plasterTypeSelect.innerHTML = `
        <option value="ceresit">Ceresit</option>
        <option value="knauf">Knauf</option>
        <option value="weber">Weber</option>
        <option value="vetonit">Vetonit</option>
        <option value="bergauf">Bergauf</option>
        <option value="linimax">Linimax</option>
        <option value="other">Другие</option>
      `;
    }
  
    // Создаём контейнер для кнопок цветов
    const colorContainer = document.createElement('div');
    colorContainer.className = 'color-buttons';
    colorContainer.style.display = 'flex';
    colorContainer.style.gap = '10px';
    colorContainer.style.flexWrap = 'wrap';
    colorContainer.style.marginBottom = '20px';
  
    // Создаём кнопки для каждого цвета
    Object.entries(presetColors).forEach(([name, hex]) => {
      const button = document.createElement('button');
      button.className = 'color-button';
      button.style.padding = '10px 20px';
      button.style.border = '2px solid #ddd';
      button.style.borderRadius = '5px';
      button.style.backgroundColor = hex;
      button.style.cursor = 'pointer';
      button.style.display = 'flex';
      button.style.flexDirection = 'column';
      button.style.alignItems = 'center';
      button.style.minWidth = '120px';
  
      const colorName = document.createElement('span');
      colorName.textContent = name;
      colorName.style.marginBottom = '5px';
      colorName.style.color = '#333';
  
      button.appendChild(colorName);
      button.addEventListener('click', () => selectColor(hex));
      colorContainer.appendChild(button);
    });
  
    // Добавляем контейнер с кнопками на страницу
    const colorPickerContainer = document.querySelector('.color-picker-container');
    if (colorPickerContainer) {
      colorPickerContainer.innerHTML = '';
      colorPickerContainer.appendChild(colorContainer);
    }
  
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const imagePath = "{% static 'images/2025-01-20_10.31.10-removebg-preview (1).png' %}";
    const originalImage = new Image();
    originalImage.src = imagePath;
    let imageData;
  
    originalImage.onload = function() {
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      ctx.drawImage(originalImage, 0, 0);
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
      const housePreview = document.querySelector('.house-preview');
      housePreview.innerHTML = '';
      housePreview.appendChild(canvas);
    };
  
    function isInColorRange(r, g, b) {
      const baseR = 131;
      const baseG = 95;
      const baseB = 71;
      const tolerance = 40;
  
      const isBaseColor =
        Math.abs(r - baseR) <= tolerance &&
        Math.abs(g - baseG) <= tolerance &&
        Math.abs(b - baseB) <= tolerance;
  
      const colorRatio =
        Math.abs((r/g) - (baseR/baseG)) < 0.2 &&
        Math.abs((g/b) - (baseG/baseB)) < 0.2;
  
      const brightness = (r + g + b) / 3;
      const isValidBrightness = brightness > 40 && brightness < 200;
  
      const isBrownish = r > g && g > b;
  
      return isBaseColor && colorRatio && isValidBrightness && isBrownish;
    }
  
    function selectColor(color) {
      const selectedColor = hexToRgb(color);
  
      const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
      );
  
      const baseBrightness = (131 + 95 + 71) / 3;
  
      for (let i = 0; i < newImageData.data.length; i += 4) {
        const r = newImageData.data[i];
        const g = newImageData.data[i + 1];
        const b = newImageData.data[i + 2];
        const a = newImageData.data[i + 3];
  
        if (isInColorRange(r, g, b) && a === 255) {
          const currentBrightness = (r + g + b) / 3;
          const shadingFactor = currentBrightness / baseBrightness;
  
          newImageData.data[i] = Math.min(255, Math.round(selectedColor.r * shadingFactor));
          newImageData.data[i + 1] = Math.min(255, Math.round(selectedColor.g * shadingFactor));
          newImageData.data[i + 2] = Math.min(255, Math.round(selectedColor.b * shadingFactor));
        }
      }
  
      ctx.putImageData(newImageData, 0, 0);
    }
  
    function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    }
  
    // Калькулятор
    document.getElementById('calculate-btn').addEventListener('click', calculate);
  
    function calculate() {
      const area = parseFloat(document.getElementById('area').value);
      const plasterType = document.getElementById('plaster-type').value;
      const insulationType = document.getElementById('insulation-type').value;
      const insulationThickness = parseInt(document.getElementById('insulation-thickness').value);
  
      if (!area || area <= 0) {
        alert('Пожалуйста, введите корректную площадь');
        return;
      }
  
      const plasterInfo = plasterPrices[plasterType];
      const plasterCost = area * plasterInfo.price;
      const plasterAmount = area * plasterInfo.consumption;
  
      let insulationCost = 0;
      if (insulationType !== 'none') {
        insulationCost = area * insulationPrices[insulationType][insulationThickness];
      }
  
      const totalCost = plasterCost + insulationCost;
  
      document.getElementById('total-cost').textContent = totalCost.toLocaleString();
      document.getElementById('materials').textContent = plasterAmount.toLocaleString();
      document.getElementById('insulation-cost').textContent = insulationCost.toLocaleString();
      document.getElementById('plaster-cost').textContent = plasterCost.toLocaleString();
      document.getElementById('result').classList.remove('hidden');
    }
  
    // Обработчики кнопок экспорта
    document.getElementById('download-btn').addEventListener('click', () => {
      const results = {
        area: document.getElementById('area').value,
        plasterType: document.getElementById('plaster-type').value,
        insulationType: document.getElementById('insulation-type').value,
        insulationThickness: document.getElementById('insulation-thickness').value,
        totalCost: document.getElementById('total-cost').textContent,
        materialsNeeded: document.getElementById('materials').textContent,
        insulationCost: document.getElementById('insulation-cost').textContent,
        plasterCost: document.getElementById('plaster-cost').textContent
      };
  
      const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'calculation-results.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  
    document.getElementById('email-btn').addEventListener('click', () => {
      const results = {
        area: document.getElementById('area').value,
        plasterType: document.getElementById('plaster-type').value,
        insulationType: document.getElementById('insulation-type').value,
        insulationThickness: document.getElementById('insulation-thickness').value,
        totalCost: document.getElementById('total-cost').textContent,
        materialsNeeded: document.getElementById('materials').textContent,
        insulationCost: document.getElementById('insulation-cost').textContent,
        plasterCost: document.getElementById('plaster-cost').textContent
      };
  
      const mailToLink = `mailto:?subject=Расчет фасадных работ&body=${encodeURIComponent(JSON.stringify(results, null, 2))}`;
      window.location.href = mailToLink;
    });
  });