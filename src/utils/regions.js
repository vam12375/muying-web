/**
 * 中国省市区数据
 * 数据结构适用于Element Plus的Cascader组件
 */

const regions = [
  {
    value: '北京市',
    label: '北京市',
    children: [
      {
        value: '北京市',
        label: '北京市',
        children: [
          { value: '东城区', label: '东城区' },
          { value: '西城区', label: '西城区' },
          { value: '朝阳区', label: '朝阳区' },
          { value: '海淀区', label: '海淀区' },
          { value: '丰台区', label: '丰台区' },
          { value: '石景山区', label: '石景山区' },
          { value: '门头沟区', label: '门头沟区' },
          { value: '房山区', label: '房山区' },
          { value: '通州区', label: '通州区' },
          { value: '顺义区', label: '顺义区' },
          { value: '昌平区', label: '昌平区' },
          { value: '大兴区', label: '大兴区' },
          { value: '平谷区', label: '平谷区' },
          { value: '怀柔区', label: '怀柔区' },
          { value: '密云区', label: '密云区' },
          { value: '延庆区', label: '延庆区' }
        ]
      }
    ]
  },
  {
    value: '天津市',
    label: '天津市',
    children: [
      {
        value: '天津市',
        label: '天津市',
        children: [
          { value: '和平区', label: '和平区' },
          { value: '河东区', label: '河东区' },
          { value: '河西区', label: '河西区' },
          { value: '南开区', label: '南开区' },
          { value: '河北区', label: '河北区' },
          { value: '红桥区', label: '红桥区' },
          { value: '东丽区', label: '东丽区' },
          { value: '西青区', label: '西青区' },
          { value: '津南区', label: '津南区' },
          { value: '北辰区', label: '北辰区' },
          { value: '武清区', label: '武清区' },
          { value: '宝坻区', label: '宝坻区' },
          { value: '滨海新区', label: '滨海新区' },
          { value: '宁河区', label: '宁河区' },
          { value: '静海区', label: '静海区' },
          { value: '蓟州区', label: '蓟州区' }
        ]
      }
    ]
  },
  {
    value: '上海市',
    label: '上海市',
    children: [
      {
        value: '上海市',
        label: '上海市',
        children: [
          { value: '黄浦区', label: '黄浦区' },
          { value: '徐汇区', label: '徐汇区' },
          { value: '长宁区', label: '长宁区' },
          { value: '静安区', label: '静安区' },
          { value: '普陀区', label: '普陀区' },
          { value: '虹口区', label: '虹口区' },
          { value: '杨浦区', label: '杨浦区' },
          { value: '闵行区', label: '闵行区' },
          { value: '宝山区', label: '宝山区' },
          { value: '嘉定区', label: '嘉定区' },
          { value: '浦东新区', label: '浦东新区' },
          { value: '金山区', label: '金山区' },
          { value: '松江区', label: '松江区' },
          { value: '青浦区', label: '青浦区' },
          { value: '奉贤区', label: '奉贤区' },
          { value: '崇明区', label: '崇明区' }
        ]
      }
    ]
  },
  {
    value: '重庆市',
    label: '重庆市',
    children: [
      {
        value: '重庆市',
        label: '重庆市',
        children: [
          { value: '万州区', label: '万州区' },
          { value: '涪陵区', label: '涪陵区' },
          { value: '渝中区', label: '渝中区' },
          { value: '大渡口区', label: '大渡口区' },
          { value: '江北区', label: '江北区' },
          { value: '沙坪坝区', label: '沙坪坝区' },
          { value: '九龙坡区', label: '九龙坡区' },
          { value: '南岸区', label: '南岸区' },
          { value: '北碚区', label: '北碚区' },
          { value: '渝北区', label: '渝北区' },
          { value: '巴南区', label: '巴南区' }
        ]
      }
    ]
  },
  {
    value: '河北省',
    label: '河北省',
    children: [
      {
        value: '石家庄市',
        label: '石家庄市',
        children: [
          { value: '长安区', label: '长安区' },
          { value: '桥西区', label: '桥西区' },
          { value: '新华区', label: '新华区' },
          { value: '井陉矿区', label: '井陉矿区' },
          { value: '裕华区', label: '裕华区' }
        ]
      },
      {
        value: '唐山市',
        label: '唐山市',
        children: [
          { value: '路南区', label: '路南区' },
          { value: '路北区', label: '路北区' },
          { value: '古冶区', label: '古冶区' },
          { value: '开平区', label: '开平区' },
          { value: '丰南区', label: '丰南区' }
        ]
      }
    ]
  },
  {
    value: '山西省',
    label: '山西省',
    children: [
      {
        value: '太原市',
        label: '太原市',
        children: [
          { value: '小店区', label: '小店区' },
          { value: '迎泽区', label: '迎泽区' },
          { value: '杏花岭区', label: '杏花岭区' },
          { value: '尖草坪区', label: '尖草坪区' },
          { value: '万柏林区', label: '万柏林区' }
        ]
      }
    ]
  },
  {
    value: '辽宁省',
    label: '辽宁省',
    children: [
      {
        value: '沈阳市',
        label: '沈阳市',
        children: [
          { value: '和平区', label: '和平区' },
          { value: '沈河区', label: '沈河区' },
          { value: '大东区', label: '大东区' },
          { value: '皇姑区', label: '皇姑区' },
          { value: '铁西区', label: '铁西区' }
        ]
      },
      {
        value: '大连市',
        label: '大连市',
        children: [
          { value: '中山区', label: '中山区' },
          { value: '西岗区', label: '西岗区' },
          { value: '沙河口区', label: '沙河口区' },
          { value: '甘井子区', label: '甘井子区' },
          { value: '旅顺口区', label: '旅顺口区' }
        ]
      }
    ]
  },
  {
    value: '江苏省',
    label: '江苏省',
    children: [
      {
        value: '南京市',
        label: '南京市',
        children: [
          { value: '玄武区', label: '玄武区' },
          { value: '秦淮区', label: '秦淮区' },
          { value: '建邺区', label: '建邺区' },
          { value: '鼓楼区', label: '鼓楼区' },
          { value: '浦口区', label: '浦口区' }
        ]
      },
      {
        value: '苏州市',
        label: '苏州市',
        children: [
          { value: '虎丘区', label: '虎丘区' },
          { value: '吴中区', label: '吴中区' },
          { value: '相城区', label: '相城区' },
          { value: '姑苏区', label: '姑苏区' },
          { value: '吴江区', label: '吴江区' }
        ]
      }
    ]
  },
  {
    value: '浙江省',
    label: '浙江省',
    children: [
      {
        value: '杭州市',
        label: '杭州市',
        children: [
          { value: '上城区', label: '上城区' },
          { value: '下城区', label: '下城区' },
          { value: '江干区', label: '江干区' },
          { value: '拱墅区', label: '拱墅区' },
          { value: '西湖区', label: '西湖区' },
          { value: '滨江区', label: '滨江区' }
        ]
      },
      {
        value: '宁波市',
        label: '宁波市',
        children: [
          { value: '海曙区', label: '海曙区' },
          { value: '江北区', label: '江北区' },
          { value: '镇海区', label: '镇海区' },
          { value: '北仑区', label: '北仑区' },
          { value: '鄞州区', label: '鄞州区' }
        ]
      }
    ]
  },
  {
    value: '安徽省',
    label: '安徽省',
    children: [
      {
        value: '合肥市',
        label: '合肥市',
        children: [
          { value: '瑶海区', label: '瑶海区' },
          { value: '庐阳区', label: '庐阳区' },
          { value: '蜀山区', label: '蜀山区' },
          { value: '包河区', label: '包河区' },
          { value: '经济技术开发区', label: '经济技术开发区' }
        ]
      }
    ]
  },
  {
    value: '福建省',
    label: '福建省',
    children: [
      {
        value: '福州市',
        label: '福州市',
        children: [
          { value: '鼓楼区', label: '鼓楼区' },
          { value: '台江区', label: '台江区' },
          { value: '仓山区', label: '仓山区' },
          { value: '马尾区', label: '马尾区' },
          { value: '晋安区', label: '晋安区' }
        ]
      },
      {
        value: '厦门市',
        label: '厦门市',
        children: [
          { value: '思明区', label: '思明区' },
          { value: '海沧区', label: '海沧区' },
          { value: '湖里区', label: '湖里区' },
          { value: '集美区', label: '集美区' },
          { value: '同安区', label: '同安区' }
        ]
      }
    ]
  },
  {
    value: '广东省',
    label: '广东省',
    children: [
      {
        value: '广州市',
        label: '广州市',
        children: [
          { value: '荔湾区', label: '荔湾区' },
          { value: '越秀区', label: '越秀区' },
          { value: '海珠区', label: '海珠区' },
          { value: '天河区', label: '天河区' },
          { value: '白云区', label: '白云区' },
          { value: '黄埔区', label: '黄埔区' }
        ]
      },
      {
        value: '深圳市',
        label: '深圳市',
        children: [
          { value: '福田区', label: '福田区' },
          { value: '罗湖区', label: '罗湖区' },
          { value: '南山区', label: '南山区' },
          { value: '宝安区', label: '宝安区' },
          { value: '龙华区', label: '龙华区' },
          { value: '龙岗区', label: '龙岗区' }
        ]
      }
    ]
  }
];

export default regions; 