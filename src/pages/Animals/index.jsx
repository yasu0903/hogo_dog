import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import AnimalList from '../../components/animals/AnimalList';
import AnimalFilter from '../../components/animals/AnimalFilter';
import { fetchAnimals } from '../../services/api';
import styles from './Animals.module.css';

const Animals = () => {
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  // 動物データを取得
  useEffect(() => {
    const loadAnimals = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // API呼び出し（エラーの場合はモックデータを使用）
        let animalData;
        try {
          animalData = await fetchAnimals();
        } catch (apiError) {
          console.warn('API接続に失敗しました。モックデータを使用します:', apiError);
          // モックデータ
          animalData = [
            {
              id: '1',
              name: 'ポチ',
              species: 'dog',
              breed: '柴犬',
              gender: 'male',
              birth_date: '2022-03-15',
              status: 'available',
              description: '人懐っこく元気な男の子です。散歩が大好きで、子供とも仲良くできます。',
              photos: [
                { id: '1', url: '/images/dog1.jpg', is_primary: true }
              ]
            },
            {
              id: '2', 
              name: 'みけ',
              species: 'cat',
              breed: '三毛猫',
              gender: 'female',
              birth_date: '2023-01-10',
              status: 'available',
              description: '甘えん坊で膝の上が大好きです。穏やかな性格で初心者の方にもおすすめです。',
              photos: [
                { id: '2', url: '/images/cat1.jpg', is_primary: true }
              ]
            },
            {
              id: '3',
              name: 'チョコ',
              species: 'dog',
              breed: 'トイプードル',
              gender: 'female',
              birth_date: '2021-08-20',
              status: 'foster',
              description: 'とても賢く、トレーニングが得意です。他の犬とも仲良くできます。',
              photos: [
                { id: '3', url: '/images/dog2.jpg', is_primary: true }
              ]
            }
          ];
        }
        
        setAnimals(animalData);
        setFilteredAnimals(animalData);
      } catch (err) {
        setError(err.message || '動物データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadAnimals();
  }, []);

  // フィルタリング処理
  useEffect(() => {
    if (!animals.length) return;

    let filtered = [...animals];

    // キーワード検索
    if (filters.search) {
      const keyword = filters.search.toLowerCase();
      filtered = filtered.filter(animal => 
        animal.name.toLowerCase().includes(keyword) ||
        (animal.breed && animal.breed.toLowerCase().includes(keyword)) ||
        (animal.description && animal.description.toLowerCase().includes(keyword))
      );
    }

    // 種類フィルター
    if (filters.species) {
      filtered = filtered.filter(animal => animal.species === filters.species);
    }

    // 性別フィルター
    if (filters.gender) {
      filtered = filtered.filter(animal => animal.gender === filters.gender);
    }

    // ステータスフィルター
    if (filters.status) {
      filtered = filtered.filter(animal => animal.status === filters.status);
    }

    // 年齢範囲フィルター
    if (filters.age_range) {
      filtered = filtered.filter(animal => {
        if (!animal.birth_date) return false;
        
        const birth = new Date(animal.birth_date);
        const today = new Date();
        const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + 
                           (today.getMonth() - birth.getMonth());
        
        switch (filters.age_range) {
          case 'baby':
            return ageInMonths <= 12;
          case 'young':
            return ageInMonths > 12 && ageInMonths <= 36;
          case 'adult':
            return ageInMonths > 36 && ageInMonths <= 84;
          case 'senior':
            return ageInMonths > 84;
          default:
            return true;
        }
      });
    }

    setFilteredAnimals(filtered);
  }, [animals, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>保護動物一覧</h1>
          <p className={styles.subtitle}>
            新しい家族を待っている動物たちと出会えます
          </p>
        </div>

        <div className={styles.content}>
          <AnimalFilter 
            onFilterChange={handleFilterChange}
            loading={loading}
          />
          
          <AnimalList 
            animals={filteredAnimals}
            loading={loading}
            error={error}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Animals;