import type { CompressModalProps } from './types';

const mock: CompressModalProps = {
  title: 'Compress PDF',
  file: {
    name: 'Q3-Annual-Reportskxdfkxdcfnkdxnsjejneknkldmfnldkfld…112.pdf',
    size: '232.2 MB',
    sizeLabel: 'Original',
    currentSizeLabel: 'Current size',
  },
  options: [
    {
      id: 'high',
      kind: 'preset',
      icon: 'high',
      title: 'High',
      description: 'Smallest size, standard quality.',
      projectedSize: '32 MB',
      savingsLabel: '85% smaller',
    },
    {
      id: 'medium',
      kind: 'preset',
      icon: 'medium',
      title: 'Medium',
      description: 'Medium size, better quality.',
      projectedSize: '154 MB',
      savingsLabel: '46% smaller',
      recommended: true,
    },
    {
      id: 'low',
      kind: 'preset',
      icon: 'low',
      title: 'Low',
      description: 'Largest size, highest quality.',
      projectedSize: '210 MB',
      savingsLabel: '12% smaller',
    },
    {
      id: 'custom',
      kind: 'custom',
      icon: 'custom',
      title: 'Custom',
      description: 'Set your own balance',
      projectedSize: '4 MB',
      savingsLabel: 'Adjustable',
    },
  ],
  initialSelectedId: 'medium',
  initialCustomValue: 90,
  customSizeRange: { minMb: 4, maxMb: 232 },
  orLabel: 'OR',
  recommendedLabel: 'RECOMMENDED',
  customSliderLabel: 'Adjust compression level',
  ctaLabelTemplate: 'Compress to {size}',
  onCompress: (result) => console.log('compress', result),
  onBack: () => console.log('back'),
  onClose: () => console.log('close'),
};

export default mock;
